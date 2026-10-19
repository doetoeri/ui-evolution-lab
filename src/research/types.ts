import type {Genome} from '../engine';
import type {Family,VarId} from '../schema';

export const EVALUATION_VERSION='phase2-eval-1.0.0';
export const SEARCH_VERSION='phase2-search-1.0.0';
export const EXPERIMENT_VERSION=2;
export const ALGORITHMS=['random','ga','ucb'] as const;
export type Algorithm=typeof ALGORITHMS[number];
export const ALGORITHM_LABELS:Record<Algorithm,string>={random:'Random Search',ga:'Genetic Algorithm',ucb:'UCB-GA'};
export type Source='Measured'|'Proxy'|'Human-rated'|'AI-rated'|'Synthetic';
export type Level=1|2;
export type Objective='static-proxy-v2'|'browser-v2'|'synthetic-surrogate-v1';
export interface Viewport {id:'mobile'|'tablet'|'desktop';width:number;height:number}
export const VIEWPORTS:Viewport[]=[{id:'mobile',width:390,height:844},{id:'tablet',width:768,height:1024},{id:'desktop',width:1440,height:900}];
export interface Weights {F:number;L:number;A:number;C:number}
export interface ExperimentConfig {
  families:Family[];algorithms:Algorithm[];activeCount:16|32|64|120;activeVariables:VarId[];
  budget:number;repetitions:number;seed:number;seeds:number[];population:number;mutationRate:number;ucbC:number;
  level:Level;objective:Objective;weights:Weights;viewports:Viewport[];
  enforceAccessibility:boolean;cache:boolean;retries:0|1;browserConcurrency:1|2;
  maxEvaluations:number;evaluationVersion:string;
}
export type Severity='minor'|'moderate'|'serious'|'critical';
export interface Rect {x:number;y:number;width:number;height:number}
export interface Issue {id:string;message:string;severity:Severity;selector:string;rect?:Rect;relatedSelector?:string;mandatory?:boolean;source:Source;screenshot?:string}
export interface RuleResult {id:string;description:string;pass:boolean;value:number;threshold?:number;penalty:number;source:'Proxy'}
export interface TaskResult {task_id:string;success:boolean;steps:number;duration_ms:number;error:string|null;assertions:string[];source:'Measured';screenshot?:string}
export interface KeyboardCheck {id:string;pass:boolean;details:string;source:'Measured'}
export interface AxeRule {id:string;impact:Severity|null;help:string;helpUrl:string;nodes:{target:string[];html:string;failureSummary?:string;rect?:Rect}[]}
export interface LayoutResult {issues:Issue[];inspected:number;ignoredIntentional:number;scrollWidth:number;clientWidth:number;scanVersion:string}
export interface BrowserViewResult {
  viewport:Viewport;layout:LayoutResult;axe:{violations:AxeRule[];incomplete:AxeRule[];passes:number;version:string};
  tasks:TaskResult[];keyboard:KeyboardCheck[];touchTargets:Issue[];reducedMotion:{pass:boolean;maxDurationMs:number;sampled:number;source:'Measured'};
  screenshot:string;duration_ms:number;
}
export interface BrowserRaw {
  kind:'playwright';environment:{browser:string;platform:string;userAgent:string;deviceScaleFactor:number;appVersion:string;runnerVersion:string;node:string};
  views:BrowserViewResult[];pageErrors:string[];measuredAt:string;attempts:number;
}
export interface StaticRaw {kind:'static';rules:RuleResult[];layoutRisk:RuleResult[];contrast:{name:string;ratio:number;threshold:number;pass:boolean}[];inactiveVariables:{id:VarId;reason:string}[];missingMeasurements:string[]}
export interface SyntheticRaw {kind:'synthetic';objective:'synthetic-surrogate-v1';formula:string;activeVariables:VarId[]}
export interface ScoreSet {F:number|null;A:number|null;L:number|null;C:number|null;Q:number|null}
export interface EvaluationPayload {
  scores:ScoreSet;sources:Record<keyof ScoreSet,Source|null>;constraints:Issue[];eligible:boolean;
  raw:StaticRaw|SyntheticRaw|{kind:'browser';browser:BrowserRaw;consistency:StaticRaw};
  formulas:Record<string,string>;error:string|null;
}
export interface EvaluationRecord {
  experiment_id:string;algorithm:Algorithm;design_family:Family;run_id:string;seed:number;candidate_id:string;
  genome_hash:string;genome_json:Genome;active_variables:VarId[];evaluation_level:Level;evaluation_version:string;objective:Objective;viewport:Viewport[];
  function_score:number|null;accessibility_score:number|null;layout_score:number|null;consistency_proxy_score:number|null;total_score:number|null;
  score_sources:EvaluationPayload['sources'];constraint_violations:Issue[];task_results:TaskResult[];evaluation_duration_ms:number|null;
  cache_hit:boolean;timestamp:string;eligible:boolean;error:string|null;raw:EvaluationPayload['raw'];formulas:Record<string,string>;
  evaluation_index:number;best_so_far:number|null;operator:string|null;reward:number|null;attempts:number;measurement_id:string;measurement_timestamp:string|null;
}
export interface Arm {id:string;label:string;n:number;rewardSum:number}
export interface RunResult {id:string;algorithm:Algorithm;family:Family;seed:number;repetition:number;curve:(number|null)[];best:number|null;bestCandidateId:string|null;unique:number;cacheHits:number;successful:number;failed:number;ineligible:number;arms:Arm[];status:'running'|'completed'|'stopped'|'cancelled';duration_ms:number}
export interface Experiment {
  version:2;experiment_id:string;name:string;config:ExperimentConfig;created_at:string;updated_at:string;
  status:'running'|'completed'|'stopped'|'cancelled'|'interrupted';records:EvaluationRecord[];runs:RunResult[];
  elapsed_ms:number;environment:Record<string,string>;warnings:string[];migration?:{from:string;notes:string[]};example?:string;
}
export interface EvaluationContext {candidateId:string;signal?:AbortSignal;config:ExperimentConfig}
export interface Evaluator {id:string;evaluate(genome:Genome,context:EvaluationContext):Promise<EvaluationPayload>}
export interface ExternalEvaluationAdapter {id:string;source:'Human-rated'|'AI-rated';evaluate(genome:Genome,context:{consent:boolean;taskIds:string[];signal?:AbortSignal}):Promise<{score:number;source:'Human-rated'|'AI-rated';raw:unknown}>}
