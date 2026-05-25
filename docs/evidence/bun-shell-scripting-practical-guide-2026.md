# Bun Shell 실험 로그 — 2026-05-25

## 실험 환경
- Bun: 1.3.14
- macOS arm64
- 샌드박스: /tmp/bun-lab-final/

## 실험 1: 기본 명령 실행 결과
```
Hello from Bun Shell
PWD: /private/tmp/bun-lab-final
```

## 실험 2: 변수 보간 (공백 포함 파일명 자동 이스케이프)
```ts
const filename = "my file.txt";  // 공백 포함
await $`echo "${filename}" > test.txt`;
// Content: my file.txt  ← 자동 이스케이프 작동
```

## 실험 3: 에러 처리 패턴
```
throw 방식 캐치: Failed with exit code 1
.nothrow() exitCode: 1
```

## 실험 4: 파이프라인
```
printf "banana\napple\ncherry\n" | sort → apple, banana, cherry
sort < input.txt | uniq → apple, banana, cherry  (중복 제거)
```

## 실험 5: 환경 변수
```
전역 env ($.env): 안녕하세요
로컬 env (.env()): only here
```

## 실험 6: Promise.all 병렬 실행
```
순차 실행 2× sleep 0.1: ~471ms
Promise.all 병렬 2× sleep 0.1: ~263ms
→ 병렬 처리 유효, macOS 프로세스 생성 오버헤드 존재
```

## 발견한 API 이슈
- `.stdin()` 메서드가 Bun 1.3.14에서 미지원 (런타임 오류)
  → 대안: `Bun.write()` + 파일 리디렉션 사용

## 결론
- Bun Shell의 변수 자동 이스케이프는 실제 동작 확인
- printf vs echo 차이: macOS에서 echo는 \n을 해석하지 않음
- .nothrow() 패턴이 실무 오류 처리에 유효
