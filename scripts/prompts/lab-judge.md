You judge one cell of an experiment that has already been run. The commands are finished. You do not run anything and you do not decide what the result means.

Cell: `{{CELL_ID}}`
Runs: `{{REPEATS}}`
Exit codes, in order: `{{EXIT_CODES}}`
Raw output: `{{RAW_DIR}}/{{CELL_ID}}-1.txt` through `-{{REPEATS}}.txt`

Criterion:

```
{{OBSERVE}}
```

Open every raw file. Judge each run against the criterion. It is a yes or a no, not a grade.

Append exactly one line of JSON to `{{RESULTS_JSONL}}` and write nothing else:

```json
{"cell":"{{CELL_ID}}","hits":2,"runs":3,"exit_codes":[0,0,1],"note":"one short line, only when a reader of the raw log would miss it"}
```

What decides whether this dataset is worth anything:

- **Count what the file shows, not what it should show.** A run whose output is empty is a miss. A run that errored is a miss. Exit code 124 means the run was killed at the timeout — that is a miss and worth a `note`.
- **A failed run is data.** Do not exclude it, do not average around it, do not describe the cell as inconclusive because one run broke. `hits` out of `runs` is the whole answer.
- **Do not repair the criterion.** If the criterion asks for a token and the output has something that looks close but is not it, that is a miss. Someone chose that token precisely so this judgment could be mechanical.
- If the raw files disagree with the exit codes handed to you, trust the raw files and say so in `note`.

`note` stays empty in the normal case. Use it when the raw output shows something the numbers hide: the same error every run, output that changed shape halfway, a run that succeeded for a different reason than the cell intended.

Do not write `plan.json`, `results.md`, `lab.json`, or anything under `src/`. Do not run commands. Do not commit.

질문하지 않는다.
