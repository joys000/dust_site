#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
후원자 자동 추가 스크립트 (macOS · Windows · Linux 공용)
─────────────────────────────────────────────────────────────────
사용법:
  macOS  : "명단추가.command" 더블클릭
  Windows: "명단추가.bat" 더블클릭
  Linux  : python3 add-donor.py
  CSV    : 위 실행파일 위로 CSV 파일 드래그앤드롭

지원 모드:
  1. 한 명씩 입력 (가장 단순)
  2. Sheets에서 복사한 텍스트 붙여넣기 (탭 구분)
  3. CSV 파일 드래그 (Google Sheets에서 다운로드)

끝나면 git push 자동 실행 옵션 제공.
"""
import sys, os, re, subprocess
from pathlib import Path
from datetime import date

# ─── Windows 한글 콘솔 깨짐 방지 ──
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stdin.reconfigure(encoding='utf-8')
    except AttributeError:
        pass  # Python 3.6 이하

SCRIPT_DIR = Path(__file__).resolve().parent
DONORS_FILE = SCRIPT_DIR / 'donors-data.js'

# ─── 유틸 ─────────────────────────────────────────────────────────────

def channel_normalize(s):
    """텍스트 → kakao/kb/toss"""
    s = (s or '').strip().lower()
    if any(x in s for x in ['카카오', 'kakao', '💛']): return 'kakao'
    if any(x in s for x in ['kb', '국민']): return 'kb'
    if any(x in s for x in ['토스', 'toss', '토스뱅크']): return 'toss'
    return ''

def parse_date(s):
    """다양한 날짜 형식 → YYYY-MM-DD"""
    s = (s or '').strip()
    if not s:
        return date.today().isoformat()
    # 한국식·점·슬래시 구분자 통일
    s = re.sub(r'[년월\.\/\s]+', '-', s).rstrip('일').strip('-')
    parts = [p for p in s.split('-') if p]
    if len(parts) >= 3:
        try:
            y, m, d = int(parts[0]), int(parts[1]), int(parts[2])
            return f"{y:04d}-{m:02d}-{d:02d}"
        except ValueError:
            pass
    return date.today().isoformat()

def escape_js_string(s):
    """JS 문자열 안에 들어갈 수 있게 따옴표·백슬래시 이스케이프"""
    if not s: return ''
    s = s.replace('\\', '\\\\').replace("'", "\\'")
    s = s.replace('\n', ' ').replace('\r', '').strip()
    return s

def add_to_donors_file(rows):
    """donors-data.js의 DONORS 배열 최상단에 새 줄들 삽입"""
    if not DONORS_FILE.exists():
        print(f"❌ {DONORS_FILE} 못 찾음")
        return False
    content = DONORS_FILE.read_text(encoding='utf-8')

    new_lines = []
    for r in rows:
        line = (
            f"  {{ name:'{escape_js_string(r['name'])}', "
            f"message:'{escape_js_string(r['message'])}', "
            f"date:'{r['date']}', "
            f"channel:'{r['channel']}' }},"
        )
        new_lines.append(line)
    new_block = '\n'.join(new_lines)

    marker = '// ── 첫 후원자가 들어오면 이 줄 위에 추가 ──'
    if marker in content:
        content = content.replace(marker, f'{new_block}\n  {marker}')
    else:
        content = re.sub(
            r'(const DONORS = \[\s*\n)',
            f'\\1{new_block}\n',
            content
        )
    DONORS_FILE.write_text(content, encoding='utf-8')
    return True

# ─── 모드 1: 한 명씩 인터랙티브 ─────────────────────────────────────────

def mode_interactive():
    print("\n☕ 후원자 한 명씩 추가\n")
    rows = []
    while True:
        print(f"[ {len(rows)+1}번째 후원자 ]")
        name = input("  이름 (필수, 그냥 Enter면 종료): ").strip()
        if not name: break
        message = input("  한 마디 (없으면 Enter): ").strip()
        date_input = input("  송금일 [YYYY-MM-DD, Enter는 오늘]: ").strip()
        date_str = parse_date(date_input)
        while True:
            channel_input = input("  채널 (kakao/kb/toss 또는 카카오/KB/토스): ").strip()
            channel = channel_normalize(channel_input)
            if channel: break
            print("  ⚠️  카카오/KB/토스 중 하나를 입력해주세요.")
        rows.append({'name': name, 'message': message, 'date': date_str, 'channel': channel})
        print(f"  ✓ 추가 대기열: {name}\n")
        more = input("  더 추가하시겠어요? (y/n) [n]: ").strip().lower()
        if more not in ('y', 'yes', 'ㅇ'): break
        print()
    return rows

# ─── 모드 2: 일괄 텍스트 붙여넣기 ──────────────────────────────────────

def mode_paste():
    print("\n📋 일괄 텍스트 붙여넣기 모드")
    print("   Sheets에서 행 선택 → Cmd+C → 여기에 Cmd+V")
    print("   (붙여넣은 후 빈 줄 두 번 입력하면 끝)")
    print()
    print("   지원 컬럼 (탭 구분):")
    print("   - 4컬럼: 이름  날짜  채널  한마디")
    print("   - 5컬럼: 송금자명  표시이름  날짜  채널  한마디")
    print("   - 6컬럼: 송금자명  표시이름  이메일  날짜  채널  한마디")
    print("   - 7컬럼(폼 그대로): 타임스탬프  송금자명  표시이름  이메일  날짜  채널  한마디")
    print("   - 8컬럼(동의 포함): + 명단공개동의 (마지막 컬럼)")
    print()

    lines = []
    blank = 0
    while True:
        try:
            line = input()
        except EOFError:
            break
        if not line.strip():
            blank += 1
            if blank >= 2: break
            continue
        blank = 0
        lines.append(line)

    rows = []
    for line in lines:
        parts = line.split('\t')
        n = len(parts)
        # 컬럼 수 자동 감지
        if n == 4:
            name, dt, ch, msg = parts[0], parts[1], parts[2], parts[3]
        elif n == 5:
            send_name, disp, dt, ch, msg = parts
            name = disp.strip() or send_name.strip()
        elif n == 6:
            send_name, disp, _email, dt, ch, msg = parts
            name = disp.strip() or send_name.strip()
        elif n == 7:
            _ts, send_name, disp, _email, dt, ch, msg = parts
            name = disp.strip() or send_name.strip()
        elif n >= 8:
            _ts, send_name, disp, _email, dt, ch, msg, *_rest = parts
            consent = parts[7] if len(parts) > 7 else ''
            if '동의' not in consent and '예' not in consent and 'Y' not in consent.upper():
                print(f"  ⏭  건너뜀 (명단 공개 미동의): {send_name}")
                continue
            name = disp.strip() or send_name.strip()
        else:
            print(f"  ⚠️  컬럼 수 이상: {line[:50]}... (건너뜀)")
            continue
        ch_norm = channel_normalize(ch)
        if not ch_norm:
            print(f"  ⚠️  채널 인식 실패: {ch} (건너뜀)")
            continue
        rows.append({
            'name': name,
            'message': msg.strip(),
            'date': parse_date(dt),
            'channel': ch_norm,
        })
    return rows

# ─── 모드 3: CSV 파일 ──────────────────────────────────────────────────

def mode_csv(csv_path):
    import csv
    csv_path = Path(csv_path).expanduser().resolve()
    if not csv_path.exists():
        print(f"❌ 파일 없음: {csv_path}")
        return []
    print(f"\n📄 CSV 파일 읽기: {csv_path.name}")
    rows = []
    with csv_path.open(encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        header = next(reader, None)
        for r in reader:
            if not r or not any(c.strip() for c in r):
                continue
            # 컬럼 매핑 (Form #2 가정: 타임스탬프, 송금자명, 표시이름, 이메일, 송금일, 채널, 한마디, 동의)
            r = (r + ['']*10)[:10]  # padding
            send_name = r[1].strip()
            disp = r[2].strip()
            dt = r[4].strip()
            ch = r[5].strip()
            msg = r[6].strip()
            consent = r[7].strip()
            if consent and '동의' not in consent and '예' not in consent:
                print(f"  ⏭  건너뜀 (미동의): {send_name}")
                continue
            ch_norm = channel_normalize(ch)
            if not ch_norm:
                print(f"  ⚠️  채널 인식 실패: {send_name} ({ch})")
                continue
            name = disp or send_name
            if not name: continue
            rows.append({
                'name': name,
                'message': msg,
                'date': parse_date(dt),
                'channel': ch_norm,
            })
    return rows

# ─── 미리보기 + 확정 ────────────────────────────────────────────────────

def preview_and_confirm(rows):
    if not rows:
        print("\n추가할 후원자가 없습니다.")
        return False
    print(f"\n━━━ 추가 미리보기 ({len(rows)}명) ━━━")
    for i, r in enumerate(rows, 1):
        msg_short = r['message'][:30] + ('...' if len(r['message']) > 30 else '')
        print(f"  {i}. {r['name']:<12} {r['date']}  {r['channel']:<6} {msg_short}")
    print()
    confirm = input("이대로 donors-data.js에 추가할까요? (y/n) [y]: ").strip().lower()
    return confirm in ('', 'y', 'yes', 'ㅇ')

# ─── 후원자 읽기 / 삭제 ────────────────────────────────────────────────

DONOR_RE = re.compile(
    r"^([ \t]*\{ name:'((?:[^'\\]|\\.)*)', message:'((?:[^'\\]|\\.)*)', date:'([^']*)', channel:'([^']*)' \},)$",
    re.MULTILINE,
)

def read_donors_from_file():
    if not DONORS_FILE.exists():
        return []
    content = DONORS_FILE.read_text(encoding='utf-8')
    results = []
    for m in DONOR_RE.finditer(content):
        results.append({
            'full_line': m.group(1),
            'name':    m.group(2).replace("\\'", "'"),
            'message': m.group(3).replace("\\'", "'"),
            'date':    m.group(4),
            'channel': m.group(5),
        })
    return results

def delete_from_donors_file(full_lines):
    content = DONORS_FILE.read_text(encoding='utf-8')
    for line in full_lines:
        content = content.replace(line + '\n', '').replace(line + '\r\n', '')
    DONORS_FILE.write_text(content, encoding='utf-8')

def mode_delete():
    donors = read_donors_from_file()
    if not donors:
        print("\n현재 후원자 명단이 비어 있습니다.")
        return

    print(f"\n━━━ 현재 후원자 명단 ({len(donors)}명) ━━━")
    for i, d in enumerate(donors, 1):
        msg_short = d['message'][:20] + ('...' if len(d['message']) > 20 else '')
        print(f"  {i:2}. {d['name']:<12} {d['date']}  {d['channel']:<6} {msg_short}")

    print()
    sel = input("삭제할 번호 입력 (예: 2  또는  1,3,5  또는  2-4): ").strip()
    if not sel:
        print("취소됨.")
        return

    try:
        indices = []
        for part in sel.split(','):
            part = part.strip()
            if '-' in part:
                a, b = part.split('-', 1)
                indices.extend(range(int(a) - 1, int(b)))
            else:
                indices.append(int(part) - 1)
        indices = sorted(set(indices))
        to_delete = [donors[i] for i in indices if 0 <= i < len(donors)]
    except (ValueError, IndexError):
        print("⚠️  올바른 번호를 입력해주세요.")
        return

    if not to_delete:
        print("취소됨.")
        return

    print(f"\n━━━ 삭제 예정 ({len(to_delete)}명) ━━━")
    for d in to_delete:
        msg_short = d['message'][:30] + ('...' if len(d['message']) > 30 else '')
        print(f"  ✕ {d['name']:<12} {d['date']}  {d['channel']:<6} {msg_short}")

    confirm = input("\n정말 삭제할까요? (y/n) [n]: ").strip().lower()
    if confirm not in ('y', 'yes', 'ㅇ'):
        print("취소됨.")
        return

    delete_from_donors_file([d['full_line'] for d in to_delete])
    print(f"\n✅ donors-data.js 업데이트 ({len(to_delete)}명 삭제)")
    git_push_optional(f'후원자 삭제 ({len(to_delete)}명)')

# ─── git push ──────────────────────────────────────────────────────────

def git_push_optional(commit_msg):
    print()
    push = input("GitHub에 자동 push 할까요? (y/n) [y]: ").strip().lower()
    if push not in ('', 'y', 'yes', 'ㅇ'):
        print("✓ 로컬 파일만 업데이트됨. 직접 push 하세요.")
        return
    try:
        os.chdir(SCRIPT_DIR)
        subprocess.run(['git', 'add', 'donors-data.js'], check=True)
        subprocess.run(['git', 'commit', '-m', commit_msg], check=True)
        subprocess.run(['git', 'push'], check=True)
        print("\n✅ GitHub push 완료. 1-2분 후 사이트 반영됩니다.")
    except subprocess.CalledProcessError as e:
        print(f"\n⚠️  git 오류 발생: {e}")
        print("   직접 commit·push 해주세요.")
    except FileNotFoundError:
        print("\n⚠️  git 명령을 찾을 수 없어요. 직접 push 해주세요.")

# ─── 메인 ──────────────────────────────────────────────────────────────

def main():
    print("═" * 60)
    print("  ☕  미세먼지 알리미 — 후원자 관리")
    print("═" * 60)

    if len(sys.argv) > 1:
        # CSV 파일 드래그
        rows = mode_csv(sys.argv[1])
        if preview_and_confirm(rows):
            if add_to_donors_file(rows):
                print(f"\n✅ donors-data.js 업데이트 ({len(rows)}명 추가)")
                git_push_optional(f'후원자 추가 ({len(rows)}명)')
        else:
            print("취소됨.")
        return

    print()
    print("어떤 작업을 하시겠어요?")
    print("  1) 후원자 추가 — 한 명씩 입력")
    print("  2) 후원자 추가 — Sheets에서 복사한 내용 일괄 붙여넣기")
    print("  3) 후원자 삭제")
    choice = input("선택 (1/2/3) [1]: ").strip() or '1'

    if choice == '3':
        mode_delete()
        return

    if choice == '2':
        rows = mode_paste()
    else:
        rows = mode_interactive()

    if preview_and_confirm(rows):
        if add_to_donors_file(rows):
            print(f"\n✅ donors-data.js 업데이트 ({len(rows)}명 추가)")
            git_push_optional(f'후원자 추가 ({len(rows)}명)')
    else:
        print("취소됨.")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n취소됨.")
    print()
    input("Enter 누르면 창 닫힘...")
