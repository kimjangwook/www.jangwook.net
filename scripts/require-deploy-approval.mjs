import { execFileSync } from 'node:child_process';
const head = execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(process.env.JANGWOOK_APPROVED_RELEASE_SHA !== head || execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim()) throw new Error('Deployment requires a clean reviewed commit and JANGWOOK_APPROVED_RELEASE_SHA. Local development does not authorize publishing.');
