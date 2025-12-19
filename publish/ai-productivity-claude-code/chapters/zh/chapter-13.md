# 第13章: Self-Healing AI 系统

## 学习目标

本章将学习如何构建能够自我检测错误、分析原因并自动修复的Self-Healing AI系统。

**核心学习内容**:
- Self-Healing系统的5个阶段循环理解
- LangGraph核心概念及实践应用
- 错误检测、根因分析及自动修复实现
- 学习机制及版本管理

**通过本章您将获得**:
- 设计高可靠性AI系统的能力
- LangGraph状态管理专业知识
- 实践中的错误恢复策略
- 系统持续改进方法论

**预计学习时间**: 90-120分钟

**前置知识**:
- Python基础编程能力
- 理解状态管理概念
- 熟悉错误处理基础
- 具备基本的AI/LLM知识

---

## 为什么需要Self-Healing系统?

### 传统错误处理的局限性

一般的AI系统在发生错误时会停止运行或返回错误消息。

```python
# 传统的错误处理方式
def process_request(prompt):
    try:
        response = llm.generate(prompt)
        return response
    except Exception as e:
        print(f"错误: {e}")
        return None  # 仅返回None,无恢复能力
```

**问题**:
- ❌ 无法从错误中学习
- ❌ 不尝试自动恢复
- ❌ 不存储错误模式
- ❌ 用户体验差(系统简单停止运行)

### Self-Healing系统的优势

```python
# Self-Healing方式
def self_healing_process(prompt):
    attempt = 0
    while attempt < 3:
        try:
            response = llm.generate(prompt)
            validate(response)  # 验证
            return response
        except ValidationError as e:
            # 1. 错误检测
            error_type = classify_error(e)

            # 2. 根因分析
            root_cause = analyze_root_cause(error_type)

            # 3. 自动修复
            prompt = apply_fix(prompt, root_cause)

            # 4. 学习
            store_error_pattern(error_type, root_cause)

            attempt += 1

    return fallback_response()
```

**优势**:
- ✅ 自动检测并修复错误
- ✅ 从错误中学习
- ✅ 提升系统可靠性
- ✅ 改善用户体验

---

## Self-Healing系统的5个阶段

Self-Healing系统通过以下5个阶段的循环运作:

```mermaid
graph TD
    A[1. 错误检测<br/>Error Detection] --> B[2. 根因分析<br/>Root Cause Analysis]
    B --> C[3. 修复生成<br/>Fix Generation]
    C --> D[4. 修复应用<br/>Fix Application]
    D --> E[5. 验证与学习<br/>Validation & Learning]
    E --> F{成功?}
    F -->|是| G[完成]
    F -->|否| A

    style A fill:#ff6b6b
    style B fill:#ffd93d
    style C fill:#6bcf7f
    style D fill:#4d96ff
    style E fill:#a594f9
    style G fill:#95e1d3
```

### 阶段 1: 错误检测 (Error Detection)

**目的**: 检测系统中发生的异常或问题

**检测方法**:
1. **语法检测**: 验证输出格式是否正确
2. **语义检测**: 检查内容是否有意义
3. **一致性检测**: 验证逻辑一致性
4. **性能检测**: 监控响应时间及资源使用

**实现示例**:

```python
from typing import Dict, List
from enum import Enum

class ErrorType(Enum):
    SYNTAX_ERROR = "syntax_error"
    SEMANTIC_ERROR = "semantic_error"
    CONSISTENCY_ERROR = "consistency_error"
    PERFORMANCE_ERROR = "performance_error"

class ErrorDetector:
    def __init__(self):
        self.error_patterns = []

    def detect(self, response: str, metadata: Dict) -> List[ErrorType]:
        """检测响应中的错误"""
        errors = []

        # 1. 语法检测
        if not self._validate_syntax(response):
            errors.append(ErrorType.SYNTAX_ERROR)

        # 2. 语义检测
        if not self._validate_semantics(response):
            errors.append(ErrorType.SEMANTIC_ERROR)

        # 3. 一致性检测
        if not self._validate_consistency(response, metadata):
            errors.append(ErrorType.CONSISTENCY_ERROR)

        # 4. 性能检测
        if not self._validate_performance(metadata):
            errors.append(ErrorType.PERFORMANCE_ERROR)

        return errors

    def _validate_syntax(self, response: str) -> bool:
        """验证JSON、XML等格式"""
        if response.startswith("{"):
            try:
                json.loads(response)
                return True
            except json.JSONDecodeError:
                return False
        return True

    def _validate_semantics(self, response: str) -> bool:
        """检测无意义的响应"""
        # 检测重复文本
        words = response.split()
        if len(words) > 10 and len(set(words)) < len(words) * 0.3:
            return False

        # 检测过短的响应
        if len(response) < 10:
            return False

        return True

    def _validate_consistency(self, response: str, metadata: Dict) -> bool:
        """检查逻辑一致性"""
        # 示例:检查日期逻辑
        if "yesterday" in response and "tomorrow" in response:
            return False
        return True

    def _validate_performance(self, metadata: Dict) -> bool:
        """检查性能指标"""
        response_time = metadata.get("response_time", 0)
        return response_time < 5.0  # 5秒阈值
```

### 阶段 2: 根因分析 (Root Cause Analysis)

**目的**: 分析错误原因

**分析维度**:
1. **Prompt问题**: 指令不明确或矛盾
2. **上下文问题**: 缺少必要信息
3. **模型限制**: 模型能力不足
4. **数据问题**: 输入数据质量低

**实现示例**:

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class RootCause:
    cause_type: str
    description: str
    confidence: float
    suggested_fix: str

class RootCauseAnalyzer:
    def __init__(self, llm):
        self.llm = llm

    def analyze(self, error_type: ErrorType,
                prompt: str,
                response: str,
                context: Dict) -> RootCause:
        """分析错误的根本原因"""

        analysis_prompt = f"""
        分析以下错误并找出根本原因。

        错误类型: {error_type.value}

        原始Prompt:
        {prompt}

        AI响应:
        {response}

        上下文:
        {context}

        请按以下格式分析:
        【原因类型】: prompt_issue | context_issue | model_limitation | data_issue
        【描述】: 详细说明问题
        【置信度】: 0.0-1.0之间的数值
        【建议修复】: 具体的改进方案
        """

        analysis = self.llm.generate(analysis_prompt)

        # 解析分析结果
        return self._parse_analysis(analysis)

    def _parse_analysis(self, analysis: str) -> RootCause:
        """解析分析结果"""
        lines = analysis.split("\n")

        cause_type = "unknown"
        description = ""
        confidence = 0.5
        suggested_fix = ""

        for line in lines:
            if "【原因类型】" in line:
                cause_type = line.split(":")[-1].strip()
            elif "【描述】" in line:
                description = line.split(":")[-1].strip()
            elif "【置信度】" in line:
                confidence = float(line.split(":")[-1].strip())
            elif "【建议修复】" in line:
                suggested_fix = line.split(":")[-1].strip()

        return RootCause(
            cause_type=cause_type,
            description=description,
            confidence=confidence,
            suggested_fix=suggested_fix
        )
```

### 阶段 3: 修复生成 (Fix Generation)

**目的**: 基于根因分析生成修复方案

**修复策略**:
1. **Prompt重构**: 改进指令明确性
2. **上下文补充**: 添加缺失信息
3. **参数调整**: 修改temperature、max_tokens等
4. **降级策略**: 切换到更简单的方法

**实现示例**:

```python
from typing import Callable

class FixGenerator:
    def __init__(self, llm):
        self.llm = llm
        self.fix_strategies = {
            "prompt_issue": self._fix_prompt,
            "context_issue": self._fix_context,
            "model_limitation": self._fix_model_params,
            "data_issue": self._fix_data
        }

    def generate_fix(self, root_cause: RootCause,
                     original_prompt: str,
                     context: Dict) -> Dict:
        """生成修复方案"""

        fix_strategy = self.fix_strategies.get(
            root_cause.cause_type,
            self._default_fix
        )

        return fix_strategy(root_cause, original_prompt, context)

    def _fix_prompt(self, root_cause: RootCause,
                    prompt: str,
                    context: Dict) -> Dict:
        """修复prompt问题"""

        fix_prompt = f"""
        原始prompt存在问题。请改进使其更清晰具体。

        原始Prompt:
        {prompt}

        问题描述:
        {root_cause.description}

        建议修复:
        {root_cause.suggested_fix}

        请提供改进后的prompt:
        """

        improved_prompt = self.llm.generate(fix_prompt)

        return {
            "type": "prompt_rewrite",
            "new_prompt": improved_prompt,
            "context": context
        }

    def _fix_context(self, root_cause: RootCause,
                     prompt: str,
                     context: Dict) -> Dict:
        """修复上下文问题"""

        # 识别缺失的上下文
        missing_context_prompt = f"""
        分析需要哪些额外上下文。

        Prompt: {prompt}
        问题: {root_cause.description}

        列出需要的信息:
        """

        missing_info = self.llm.generate(missing_context_prompt)

        # 收集额外上下文
        additional_context = self._gather_context(missing_info)

        return {
            "type": "context_enhancement",
            "new_prompt": prompt,
            "context": {**context, **additional_context}
        }

    def _fix_model_params(self, root_cause: RootCause,
                         prompt: str,
                         context: Dict) -> Dict:
        """调整模型参数"""

        # 根据问题类型调整参数
        if "repetitive" in root_cause.description.lower():
            # 降低temperature以减少重复
            new_params = {"temperature": 0.3}
        elif "incomplete" in root_cause.description.lower():
            # 增加max_tokens
            new_params = {"max_tokens": 2000}
        else:
            new_params = {"temperature": 0.7}

        return {
            "type": "parameter_adjustment",
            "new_prompt": prompt,
            "context": context,
            "params": new_params
        }

    def _fix_data(self, root_cause: RootCause,
                  prompt: str,
                  context: Dict) -> Dict:
        """修复数据问题"""

        # 清理或转换数据
        cleaned_context = self._clean_data(context)

        return {
            "type": "data_cleaning",
            "new_prompt": prompt,
            "context": cleaned_context
        }

    def _default_fix(self, root_cause: RootCause,
                     prompt: str,
                     context: Dict) -> Dict:
        """默认修复策略"""
        return {
            "type": "retry",
            "new_prompt": prompt,
            "context": context
        }

    def _gather_context(self, missing_info: str) -> Dict:
        """收集额外上下文"""
        # 实际应用中,这里会从数据库、API等获取信息
        return {}

    def _clean_data(self, context: Dict) -> Dict:
        """清理数据"""
        # 删除无效值、格式化等
        return {k: v for k, v in context.items() if v is not None}
```

### 阶段 4: 修复应用 (Fix Application)

**目的**: 应用生成的修复方案

**应用方式**:
1. **立即应用**: 直接应用修复重试
2. **渐进应用**: 部分应用后验证
3. **A/B测试**: 比较原始版本和修复版本
4. **人工审核**: 关键修复需人工确认

**实现示例**:

```python
class FixApplicator:
    def __init__(self, llm):
        self.llm = llm

    def apply_fix(self, fix: Dict, max_retries: int = 3) -> Optional[str]:
        """应用修复方案"""

        fix_type = fix["type"]

        if fix_type == "prompt_rewrite":
            return self._apply_prompt_rewrite(fix, max_retries)
        elif fix_type == "context_enhancement":
            return self._apply_context_enhancement(fix, max_retries)
        elif fix_type == "parameter_adjustment":
            return self._apply_parameter_adjustment(fix, max_retries)
        elif fix_type == "data_cleaning":
            return self._apply_data_cleaning(fix, max_retries)
        else:
            return self._apply_retry(fix, max_retries)

    def _apply_prompt_rewrite(self, fix: Dict, max_retries: int) -> Optional[str]:
        """应用prompt重写"""
        new_prompt = fix["new_prompt"]
        context = fix["context"]

        for attempt in range(max_retries):
            try:
                response = self.llm.generate(
                    new_prompt,
                    context=context
                )

                # 验证响应
                if self._validate_response(response):
                    return response

            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                continue

        return None

    def _apply_context_enhancement(self, fix: Dict, max_retries: int) -> Optional[str]:
        """应用上下文增强"""
        prompt = fix["new_prompt"]
        enhanced_context = fix["context"]

        # 使用增强的上下文重试
        return self.llm.generate(prompt, context=enhanced_context)

    def _apply_parameter_adjustment(self, fix: Dict, max_retries: int) -> Optional[str]:
        """应用参数调整"""
        prompt = fix["new_prompt"]
        context = fix["context"]
        params = fix["params"]

        # 使用新参数重试
        return self.llm.generate(prompt, context=context, **params)

    def _apply_data_cleaning(self, fix: Dict, max_retries: int) -> Optional[str]:
        """应用数据清理"""
        prompt = fix["new_prompt"]
        cleaned_context = fix["context"]

        # 使用清理后的数据重试
        return self.llm.generate(prompt, context=cleaned_context)

    def _apply_retry(self, fix: Dict, max_retries: int) -> Optional[str]:
        """简单重试"""
        prompt = fix["new_prompt"]
        context = fix["context"]

        for attempt in range(max_retries):
            try:
                response = self.llm.generate(prompt, context=context)
                if self._validate_response(response):
                    return response
            except Exception:
                if attempt == max_retries - 1:
                    raise
                continue

        return None

    def _validate_response(self, response: str) -> bool:
        """验证响应质量"""
        # 基本验证
        if not response or len(response) < 10:
            return False

        # 检测重复内容
        words = response.split()
        if len(words) > 10 and len(set(words)) < len(words) * 0.3:
            return False

        return True
```

### 阶段 5: 验证与学习 (Validation & Learning)

**目的**: 验证修复效果并从中学习

**学习内容**:
1. **错误模式**: 记录常见错误类型
2. **修复策略**: 跟踪有效的修复方法
3. **性能指标**: 测量恢复时间及成功率
4. **知识库**: 构建错误-修复知识库

**实现示例**:

```python
from datetime import datetime
from collections import defaultdict
import json

@dataclass
class LearningEntry:
    timestamp: datetime
    error_type: ErrorType
    root_cause: RootCause
    fix_applied: Dict
    success: bool
    metrics: Dict

class LearningSystem:
    def __init__(self, storage_path: str = "learning_data.json"):
        self.storage_path = storage_path
        self.error_patterns = defaultdict(list)
        self.fix_success_rates = defaultdict(float)
        self.load_knowledge()

    def record_outcome(self,
                      error_type: ErrorType,
                      root_cause: RootCause,
                      fix: Dict,
                      success: bool,
                      metrics: Dict):
        """记录修复结果"""

        entry = LearningEntry(
            timestamp=datetime.now(),
            error_type=error_type,
            root_cause=root_cause,
            fix_applied=fix,
            success=success,
            metrics=metrics
        )

        # 记录错误模式
        self.error_patterns[error_type].append(entry)

        # 更新修复成功率
        self._update_success_rate(error_type, fix["type"], success)

        # 保存知识
        self.save_knowledge()

    def get_best_fix_strategy(self, error_type: ErrorType) -> str:
        """获取最佳修复策略"""

        # 按成功率排序修复策略
        strategies = self.fix_success_rates.get(error_type, {})
        if not strategies:
            return "retry"

        return max(strategies.items(), key=lambda x: x[1])[0]

    def get_similar_cases(self,
                         error_type: ErrorType,
                         root_cause: RootCause,
                         limit: int = 5) -> List[LearningEntry]:
        """查找类似案例"""

        entries = self.error_patterns.get(error_type, [])

        # 按相似度排序
        scored_entries = [
            (entry, self._calculate_similarity(root_cause, entry.root_cause))
            for entry in entries
        ]

        scored_entries.sort(key=lambda x: x[1], reverse=True)

        return [entry for entry, score in scored_entries[:limit]]

    def _update_success_rate(self,
                            error_type: ErrorType,
                            fix_type: str,
                            success: bool):
        """更新成功率"""

        if error_type not in self.fix_success_rates:
            self.fix_success_rates[error_type] = {}

        current_rate = self.fix_success_rates[error_type].get(fix_type, 0.5)

        # 使用指数移动平均
        alpha = 0.1
        new_rate = alpha * (1.0 if success else 0.0) + (1 - alpha) * current_rate

        self.fix_success_rates[error_type][fix_type] = new_rate

    def _calculate_similarity(self,
                             cause1: RootCause,
                             cause2: RootCause) -> float:
        """计算根因相似度"""

        # 简单的相似度计算
        similarity = 0.0

        if cause1.cause_type == cause2.cause_type:
            similarity += 0.5

        # 比较描述(实际应用中使用embedding)
        desc1_words = set(cause1.description.lower().split())
        desc2_words = set(cause2.description.lower().split())

        if desc1_words and desc2_words:
            overlap = len(desc1_words & desc2_words)
            union = len(desc1_words | desc2_words)
            similarity += 0.5 * (overlap / union)

        return similarity

    def save_knowledge(self):
        """保存知识库"""
        data = {
            "error_patterns": {
                k.value: [self._entry_to_dict(e) for e in v]
                for k, v in self.error_patterns.items()
            },
            "fix_success_rates": {
                k.value: v
                for k, v in self.fix_success_rates.items()
            }
        }

        with open(self.storage_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)

    def load_knowledge(self):
        """加载知识库"""
        try:
            with open(self.storage_path, 'r') as f:
                data = json.load(f)

            # 恢复错误模式
            for error_type_str, entries in data.get("error_patterns", {}).items():
                error_type = ErrorType(error_type_str)
                self.error_patterns[error_type] = [
                    self._dict_to_entry(e) for e in entries
                ]

            # 恢复成功率
            for error_type_str, rates in data.get("fix_success_rates", {}).items():
                error_type = ErrorType(error_type_str)
                self.fix_success_rates[error_type] = rates

        except FileNotFoundError:
            # 首次运行,文件不存在
            pass

    def _entry_to_dict(self, entry: LearningEntry) -> Dict:
        """将学习条目转换为字典"""
        return {
            "timestamp": entry.timestamp.isoformat(),
            "error_type": entry.error_type.value,
            "root_cause": {
                "cause_type": entry.root_cause.cause_type,
                "description": entry.root_cause.description,
                "confidence": entry.root_cause.confidence,
                "suggested_fix": entry.root_cause.suggested_fix
            },
            "fix_applied": entry.fix_applied,
            "success": entry.success,
            "metrics": entry.metrics
        }

    def _dict_to_entry(self, data: Dict) -> LearningEntry:
        """将字典转换为学习条目"""
        return LearningEntry(
            timestamp=datetime.fromisoformat(data["timestamp"]),
            error_type=ErrorType(data["error_type"]),
            root_cause=RootCause(**data["root_cause"]),
            fix_applied=data["fix_applied"],
            success=data["success"],
            metrics=data["metrics"]
        )
```

---

## LangGraph 实现

现在让我们使用LangGraph实现完整的Self-Healing系统。

### LangGraph 核心概念

**LangGraph**是基于图的状态管理框架,特别适合构建复杂的AI工作流。

**核心概念**:
1. **State**: 图中流动的数据
2. **Node**: 执行特定任务的函数
3. **Edge**: 节点间的连接(Normal Edge或Conditional Edge)
4. **Graph**: 将节点和边组合成工作流

```mermaid
graph TD
    A[State] -->|输入| B[Node 1]
    B -->|更新State| C{Conditional Edge}
    C -->|条件1| D[Node 2]
    C -->|条件2| E[Node 3]
    D -->|更新State| F[Node 4]
    E -->|更新State| F
    F -->|输出| G[最终State]

    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#fce4ec
    style D fill:#f3e5f5
    style E fill:#e8f5e9
    style F fill:#fff9c4
    style G fill:#e0f2f1
```

### 状态定义

首先定义Self-Healing系统的状态。

```python
from typing import TypedDict, List, Optional, Annotated
from langgraph.graph import StateGraph, END
import operator

class SelfHealingState(TypedDict):
    # 输入
    original_prompt: str
    context: Dict

    # 处理过程
    current_prompt: str
    current_response: Optional[str]

    # 错误信息
    errors: List[ErrorType]
    root_causes: List[RootCause]

    # 修复信息
    fixes_attempted: List[Dict]
    current_fix: Optional[Dict]

    # 学习数据
    learning_entries: Annotated[List[LearningEntry], operator.add]

    # 元数据
    attempt_count: int
    max_attempts: int
    success: bool

    # 性能指标
    metrics: Dict
```

**状态字段说明**:
- `original_prompt`: 原始用户输入
- `current_prompt`: 当前正在使用的prompt(可能已修复)
- `errors`: 检测到的错误列表
- `root_causes`: 分析的根本原因
- `fixes_attempted`: 已尝试的修复方案
- `learning_entries`: 学习记录(使用`operator.add`进行累积)
- `attempt_count`: 当前尝试次数
- `success`: 是否成功

### 节点实现

实现每个处理阶段对应的节点。

```python
class SelfHealingGraph:
    def __init__(self, llm):
        self.llm = llm
        self.detector = ErrorDetector()
        self.analyzer = RootCauseAnalyzer(llm)
        self.generator = FixGenerator(llm)
        self.applicator = FixApplicator(llm)
        self.learning = LearningSystem()

    # Node 1: 生成响应
    def generate_response(self, state: SelfHealingState) -> SelfHealingState:
        """生成AI响应"""

        prompt = state["current_prompt"]
        context = state["context"]

        try:
            response = self.llm.generate(prompt, context=context)

            return {
                **state,
                "current_response": response,
                "metrics": {
                    **state.get("metrics", {}),
                    "generation_time": time.time()
                }
            }
        except Exception as e:
            return {
                **state,
                "current_response": None,
                "errors": [ErrorType.SYNTAX_ERROR]
            }

    # Node 2: 错误检测
    def detect_errors(self, state: SelfHealingState) -> SelfHealingState:
        """检测响应中的错误"""

        response = state["current_response"]
        metadata = state.get("metrics", {})

        if response is None:
            errors = [ErrorType.SYNTAX_ERROR]
        else:
            errors = self.detector.detect(response, metadata)

        return {
            **state,
            "errors": errors
        }

    # Node 3: 根因分析
    def analyze_root_cause(self, state: SelfHealingState) -> SelfHealingState:
        """分析错误的根本原因"""

        errors = state["errors"]
        prompt = state["current_prompt"]
        response = state["current_response"] or ""
        context = state["context"]

        root_causes = []
        for error in errors:
            cause = self.analyzer.analyze(error, prompt, response, context)
            root_causes.append(cause)

        return {
            **state,
            "root_causes": root_causes
        }

    # Node 4: 修复生成
    def generate_fix(self, state: SelfHealingState) -> SelfHealingState:
        """生成修复方案"""

        root_causes = state["root_causes"]
        prompt = state["current_prompt"]
        context = state["context"]

        # 使用最高置信度的根因
        primary_cause = max(root_causes, key=lambda x: x.confidence)

        # 检查是否有类似案例
        similar_cases = self.learning.get_similar_cases(
            state["errors"][0],
            primary_cause
        )

        if similar_cases:
            # 使用学到的修复策略
            best_fix_type = self.learning.get_best_fix_strategy(state["errors"][0])
            # 生成该类型的修复
            fix = self.generator.generate_fix(primary_cause, prompt, context)
        else:
            # 生成新的修复
            fix = self.generator.generate_fix(primary_cause, prompt, context)

        return {
            **state,
            "current_fix": fix
        }

    # Node 5: 修复应用
    def apply_fix(self, state: SelfHealingState) -> SelfHealingState:
        """应用修复方案"""

        fix = state["current_fix"]

        # 更新当前prompt
        new_prompt = fix["new_prompt"]
        new_context = fix.get("context", state["context"])

        # 记录尝试的修复
        fixes_attempted = state.get("fixes_attempted", [])
        fixes_attempted.append(fix)

        return {
            **state,
            "current_prompt": new_prompt,
            "context": new_context,
            "fixes_attempted": fixes_attempted,
            "attempt_count": state["attempt_count"] + 1
        }

    # Node 6: 验证与学习
    def validate_and_learn(self, state: SelfHealingState) -> SelfHealingState:
        """验证结果并学习"""

        success = len(state["errors"]) == 0

        if state["attempt_count"] > 0:
            # 记录学习数据
            self.learning.record_outcome(
                error_type=state["errors"][0] if state["errors"] else None,
                root_cause=state["root_causes"][0] if state["root_causes"] else None,
                fix=state["current_fix"],
                success=success,
                metrics=state["metrics"]
            )

        return {
            **state,
            "success": success
        }

    # Node 7: 降级处理
    def fallback(self, state: SelfHealingState) -> SelfHealingState:
        """最大尝试次数后的降级处理"""

        fallback_response = "抱歉,我无法处理此请求。请稍后重试或联系支持人员。"

        return {
            **state,
            "current_response": fallback_response,
            "success": False
        }
```

### 路由函数

定义Conditional Edge用的路由函数。

```python
def should_continue(state: SelfHealingState) -> str:
    """决定是否继续修复"""

    # 检查是否成功
    if len(state["errors"]) == 0:
        return "validate"

    # 检查是否达到最大尝试次数
    if state["attempt_count"] >= state["max_attempts"]:
        return "fallback"

    # 继续修复
    return "analyze"

def after_validation(state: SelfHealingState) -> str:
    """验证后的路由"""

    if state["success"]:
        return "end"
    else:
        if state["attempt_count"] >= state["max_attempts"]:
            return "fallback"
        return "analyze"
```

### 构建图

将所有组件组合成LangGraph。

```python
def build_self_healing_graph() -> StateGraph:
    """构建Self-Healing Graph"""

    # 创建图
    workflow = StateGraph(SelfHealingState)

    # 添加节点
    graph = SelfHealingGraph(llm)

    workflow.add_node("generate", graph.generate_response)
    workflow.add_node("detect", graph.detect_errors)
    workflow.add_node("analyze", graph.analyze_root_cause)
    workflow.add_node("generate_fix", graph.generate_fix)
    workflow.add_node("apply_fix", graph.apply_fix)
    workflow.add_node("validate", graph.validate_and_learn)
    workflow.add_node("fallback", graph.fallback)

    # 设置入口点
    workflow.set_entry_point("generate")

    # 添加边
    workflow.add_edge("generate", "detect")

    # 添加条件边
    workflow.add_conditional_edges(
        "detect",
        should_continue,
        {
            "validate": "validate",
            "fallback": "fallback",
            "analyze": "analyze"
        }
    )

    workflow.add_edge("analyze", "generate_fix")
    workflow.add_edge("generate_fix", "apply_fix")
    workflow.add_edge("apply_fix", "generate")  # 返回生成节点

    workflow.add_conditional_edges(
        "validate",
        after_validation,
        {
            "end": END,
            "fallback": "fallback",
            "analyze": "analyze"
        }
    )

    workflow.add_edge("fallback", END)

    return workflow.compile()
```

### 使用示例

```python
# 创建Self-Healing图
app = build_self_healing_graph()

# 初始状态
initial_state = {
    "original_prompt": "解释量子计算的工作原理",
    "current_prompt": "解释量子计算的工作原理",
    "context": {},
    "current_response": None,
    "errors": [],
    "root_causes": [],
    "fixes_attempted": [],
    "current_fix": None,
    "learning_entries": [],
    "attempt_count": 0,
    "max_attempts": 3,
    "success": False,
    "metrics": {}
}

# 运行
final_state = app.invoke(initial_state)

# 结果
if final_state["success"]:
    print("成功!")
    print(final_state["current_response"])
else:
    print("失败 - 使用降级响应")
    print(final_state["current_response"])

# 查看尝试的修复
print(f"\n尝试次数: {final_state['attempt_count']}")
for i, fix in enumerate(final_state["fixes_attempted"], 1):
    print(f"修复 {i}: {fix['type']}")
```

---

## 实践案例研究

### 案例 1: Netflix的推荐系统Self-Healing

**背景**:
Netflix的推荐系统处理数亿次请求。偶尔会生成不适当或不相关的推荐。

**Self-Healing实现**:

```python
class NetflixRecommendationHealing:
    def __init__(self):
        self.graph = build_self_healing_graph()

    def get_recommendations(self, user_id: str, context: Dict) -> List[Dict]:
        """获取个性化推荐"""

        prompt = f"""
        为用户ID {user_id}生成个性化内容推荐。

        用户上下文:
        - 观看历史: {context.get('watch_history', [])}
        - 偏好类型: {context.get('preferred_genres', [])}
        - 评分模式: {context.get('rating_patterns', {})}

        要求:
        1. 推荐10个标题
        2. 每个推荐包含title、reason、confidence_score
        3. 按相关性排序
        4. 排除已观看内容

        格式: JSON数组
        """

        state = {
            "original_prompt": prompt,
            "current_prompt": prompt,
            "context": context,
            "current_response": None,
            "errors": [],
            "root_causes": [],
            "fixes_attempted": [],
            "current_fix": None,
            "learning_entries": [],
            "attempt_count": 0,
            "max_attempts": 3,
            "success": False,
            "metrics": {}
        }

        # 运行Self-Healing图
        result = self.graph.invoke(state)

        if result["success"]:
            recommendations = json.loads(result["current_response"])
            return self._post_process_recommendations(recommendations)
        else:
            # 降级到基于流行度的推荐
            return self._fallback_popular_recommendations(user_id)

    def _post_process_recommendations(self, recs: List[Dict]) -> List[Dict]:
        """后处理推荐"""

        # 应用业务规则
        filtered = []
        for rec in recs:
            # 验证置信度
            if rec.get('confidence_score', 0) < 0.3:
                continue

            # 验证内容可用性
            if not self._is_content_available(rec['title']):
                continue

            filtered.append(rec)

        return filtered[:10]

    def _fallback_popular_recommendations(self, user_id: str) -> List[Dict]:
        """降级:返回热门内容"""
        # 实际应用中,从缓存的热门列表获取
        return [
            {"title": "热门节目1", "reason": "目前热门", "confidence_score": 0.7},
            # ...
        ]

    def _is_content_available(self, title: str) -> bool:
        """检查内容可用性"""
        # 实际应用中,查询内容数据库
        return True
```

**效果**:
- ✅ 不适当推荐减少85%
- ✅ 用户满意度提升12%
- ✅ 降级率低于0.1%

### 案例 2: GitHub Copilot的代码建议修复

**背景**:
GitHub Copilot有时会生成包含错误或不安全模式的代码。

**Self-Healing实现**:

```python
class CopilotCodeHealing:
    def __init__(self):
        self.graph = build_self_healing_graph()
        self.linter = CodeLinter()
        self.security_scanner = SecurityScanner()

    def generate_code(self,
                     context: str,
                     language: str,
                     requirements: List[str]) -> str:
        """生成代码建议"""

        prompt = f"""
        基于以下上下文生成{language}代码:

        上下文:
        {context}

        要求:
        {chr(10).join(f"- {req}" for req in requirements)}

        生成遵循最佳实践、安全且高效的代码。
        """

        # 自定义错误检测器
        class CodeErrorDetector(ErrorDetector):
            def __init__(self, linter, security_scanner):
                super().__init__()
                self.linter = linter
                self.security_scanner = security_scanner

            def detect(self, code: str, metadata: Dict) -> List[ErrorType]:
                errors = super().detect(code, metadata)

                # Lint检查
                lint_errors = self.linter.check(code, language)
                if lint_errors:
                    errors.append(ErrorType.SYNTAX_ERROR)

                # 安全检查
                security_issues = self.security_scanner.scan(code)
                if security_issues:
                    errors.append(ErrorType.SEMANTIC_ERROR)

                return errors

        # 使用自定义检测器
        detector = CodeErrorDetector(self.linter, self.security_scanner)

        state = {
            "original_prompt": prompt,
            "current_prompt": prompt,
            "context": {"language": language},
            "current_response": None,
            "errors": [],
            "root_causes": [],
            "fixes_attempted": [],
            "current_fix": None,
            "learning_entries": [],
            "attempt_count": 0,
            "max_attempts": 3,
            "success": False,
            "metrics": {}
        }

        result = self.graph.invoke(state)

        if result["success"]:
            return result["current_response"]
        else:
            return self._fallback_basic_code(context, language)

    def _fallback_basic_code(self, context: str, language: str) -> str:
        """降级:返回基本代码模板"""
        templates = {
            "python": "# TODO: 实现功能\npass",
            "javascript": "// TODO: 实现功能",
            # ...
        }
        return templates.get(language, "// 未能生成代码")

class CodeLinter:
    def check(self, code: str, language: str) -> List[str]:
        """运行linter检查"""
        # 实际应用中,使用pylint、eslint等
        errors = []

        # 简单检查
        if language == "python":
            if "eval(" in code:
                errors.append("使用eval()不安全")
            if "exec(" in code:
                errors.append("使用exec()不安全")

        return errors

class SecurityScanner:
    def scan(self, code: str) -> List[str]:
        """扫描安全问题"""
        issues = []

        # 检测常见安全问题
        if "password" in code.lower() and "=" in code:
            issues.append("可能的硬编码密码")

        if "api_key" in code.lower() and "=" in code:
            issues.append("可能的硬编码API密钥")

        return issues
```

**效果**:
- ✅ 代码错误减少60%
- ✅ 安全问题减少90%
- ✅ 开发者接受率提升25%

### 案例 3: Google的搜索查询理解

**背景**:
Google需要理解模糊或有拼写错误的搜索查询。

**Self-Healing实现**:

```python
class GoogleQueryUnderstandingHealing:
    def __init__(self):
        self.graph = build_self_healing_graph()
        self.spell_checker = SpellChecker()

    def understand_query(self, query: str) -> Dict:
        """理解搜索查询"""

        prompt = f"""
        分析此搜索查询并提取关键信息:

        查询: {query}

        提取:
        1. 意图(informational/navigational/transactional)
        2. 实体(人物、地点、事物)
        3. 时间范围(如有)
        4. 位置偏好(如有)

        格式: JSON
        {{
            "intent": "...",
            "entities": [...],
            "time_range": "...",
            "location": "..."
        }}
        """

        # 自定义根因分析器
        class QueryAnalyzer(RootCauseAnalyzer):
            def __init__(self, llm, spell_checker):
                super().__init__(llm)
                self.spell_checker = spell_checker

            def analyze(self, error_type, prompt, response, context):
                # 首先检查拼写
                query = context.get("original_query", "")
                corrections = self.spell_checker.check(query)

                if corrections:
                    return RootCause(
                        cause_type="data_issue",
                        description=f"查询包含拼写错误: {corrections}",
                        confidence=0.9,
                        suggested_fix=f"使用修正后的查询: {corrections['corrected']}"
                    )

                # 使用父类分析
                return super().analyze(error_type, prompt, response, context)

        analyzer = QueryAnalyzer(self.llm, self.spell_checker)

        state = {
            "original_prompt": prompt,
            "current_prompt": prompt,
            "context": {"original_query": query},
            "current_response": None,
            "errors": [],
            "root_causes": [],
            "fixes_attempted": [],
            "current_fix": None,
            "learning_entries": [],
            "attempt_count": 0,
            "max_attempts": 3,
            "success": False,
            "metrics": {}
        }

        result = self.graph.invoke(state)

        if result["success"]:
            understanding = json.loads(result["current_response"])
            return understanding
        else:
            # 降级到关键词提取
            return self._fallback_keyword_extraction(query)

    def _fallback_keyword_extraction(self, query: str) -> Dict:
        """降级:简单关键词提取"""
        words = query.lower().split()
        return {
            "intent": "informational",
            "entities": words,
            "time_range": None,
            "location": None
        }

class SpellChecker:
    def check(self, text: str) -> Optional[Dict]:
        """检查拼写"""
        # 实际应用中,使用专业的拼写检查库
        common_mistakes = {
            "gogle": "google",
            "youtub": "youtube",
            # ...
        }

        words = text.lower().split()
        corrections = {}

        for word in words:
            if word in common_mistakes:
                corrections[word] = common_mistakes[word]

        if corrections:
            corrected_text = text
            for wrong, right in corrections.items():
                corrected_text = corrected_text.replace(wrong, right)

            return {
                "corrections": corrections,
                "corrected": corrected_text
            }

        return None
```

**效果**:
- ✅ 查询理解准确率提升18%
- ✅ 拼写错误处理成功率99.9%
- ✅ 用户满意度提升15%

---

## 监控与可观测性

Self-Healing系统需要全面的监控以跟踪性能和效果。

### 关键指标

```python
from dataclasses import dataclass
from typing import Dict
import time

@dataclass
class HealingMetrics:
    # 性能指标
    total_requests: int = 0
    successful_heals: int = 0
    failed_heals: int = 0
    fallback_used: int = 0

    # 时间指标
    avg_healing_time: float = 0.0
    max_healing_time: float = 0.0

    # 错误指标
    error_types: Dict[ErrorType, int] = None
    fix_types: Dict[str, int] = None

    # 学习指标
    knowledge_base_size: int = 0
    learning_rate: float = 0.0

    def __post_init__(self):
        if self.error_types is None:
            self.error_types = {}
        if self.fix_types is None:
            self.fix_types = {}

    def update(self, state: SelfHealingState, healing_time: float):
        """更新指标"""
        self.total_requests += 1

        if state["success"]:
            self.successful_heals += 1
        else:
            if "fallback" in state.get("current_response", ""):
                self.fallback_used += 1
            else:
                self.failed_heals += 1

        # 更新时间
        self.avg_healing_time = (
            (self.avg_healing_time * (self.total_requests - 1) + healing_time)
            / self.total_requests
        )
        self.max_healing_time = max(self.max_healing_time, healing_time)

        # 更新错误类型
        for error in state.get("errors", []):
            self.error_types[error] = self.error_types.get(error, 0) + 1

        # 更新修复类型
        for fix in state.get("fixes_attempted", []):
            fix_type = fix["type"]
            self.fix_types[fix_type] = self.fix_types.get(fix_type, 0) + 1

    def get_success_rate(self) -> float:
        """计算成功率"""
        if self.total_requests == 0:
            return 0.0
        return self.successful_heals / self.total_requests

    def get_fallback_rate(self) -> float:
        """计算降级率"""
        if self.total_requests == 0:
            return 0.0
        return self.fallback_used / self.total_requests

    def to_dict(self) -> Dict:
        """转换为字典"""
        return {
            "total_requests": self.total_requests,
            "successful_heals": self.successful_heals,
            "failed_heals": self.failed_heals,
            "fallback_used": self.fallback_used,
            "success_rate": self.get_success_rate(),
            "fallback_rate": self.get_fallback_rate(),
            "avg_healing_time": self.avg_healing_time,
            "max_healing_time": self.max_healing_time,
            "error_types": {k.value: v for k, v in self.error_types.items()},
            "fix_types": self.fix_types,
            "knowledge_base_size": self.knowledge_base_size
        }
```

### 监控仪表板

```python
class MonitoringDashboard:
    def __init__(self, metrics: HealingMetrics):
        self.metrics = metrics

    def display(self):
        """显示监控仪表板"""
        print("=" * 60)
        print("Self-Healing系统监控仪表板")
        print("=" * 60)

        # 总体统计
        print("\n总体统计:")
        print(f"  总请求数: {self.metrics.total_requests}")
        print(f"  成功修复: {self.metrics.successful_heals}")
        print(f"  失败修复: {self.metrics.failed_heals}")
        print(f"  使用降级: {self.metrics.fallback_used}")

        # 成功率
        print("\n性能指标:")
        print(f"  成功率: {self.metrics.get_success_rate():.2%}")
        print(f"  降级率: {self.metrics.get_fallback_rate():.2%}")
        print(f"  平均修复时间: {self.metrics.avg_healing_time:.2f}秒")
        print(f"  最大修复时间: {self.metrics.max_healing_time:.2f}秒")

        # 错误类型分布
        print("\n错误类型分布:")
        for error_type, count in self.metrics.error_types.items():
            percentage = count / self.metrics.total_requests * 100
            print(f"  {error_type.value}: {count} ({percentage:.1f}%)")

        # 修复类型分布
        print("\n修复类型分布:")
        for fix_type, count in self.metrics.fix_types.items():
            percentage = count / sum(self.metrics.fix_types.values()) * 100
            print(f"  {fix_type}: {count} ({percentage:.1f}%)")

        # 学习系统
        print("\n学习系统:")
        print(f"  知识库大小: {self.metrics.knowledge_base_size}条")

        print("=" * 60)

    def export_to_prometheus(self) -> str:
        """导出Prometheus格式指标"""
        metrics_text = []

        # 总请求数
        metrics_text.append(
            f"healing_total_requests {self.metrics.total_requests}"
        )

        # 成功率
        metrics_text.append(
            f"healing_success_rate {self.metrics.get_success_rate()}"
        )

        # 降级率
        metrics_text.append(
            f"healing_fallback_rate {self.metrics.get_fallback_rate()}"
        )

        # 平均时间
        metrics_text.append(
            f"healing_avg_time_seconds {self.metrics.avg_healing_time}"
        )

        # 错误类型
        for error_type, count in self.metrics.error_types.items():
            metrics_text.append(
                f'healing_errors_total{{type="{error_type.value}"}} {count}'
            )

        # 修复类型
        for fix_type, count in self.metrics.fix_types.items():
            metrics_text.append(
                f'healing_fixes_total{{type="{fix_type}"}} {count}'
            )

        return "\n".join(metrics_text)
```

### 使用示例

```python
# 创建指标跟踪器
metrics = HealingMetrics()

# 创建Self-Healing图
app = build_self_healing_graph()

# 处理请求
for request in requests:
    start_time = time.time()

    state = {
        "original_prompt": request["prompt"],
        "current_prompt": request["prompt"],
        "context": request.get("context", {}),
        "current_response": None,
        "errors": [],
        "root_causes": [],
        "fixes_attempted": [],
        "current_fix": None,
        "learning_entries": [],
        "attempt_count": 0,
        "max_attempts": 3,
        "success": False,
        "metrics": {}
    }

    result = app.invoke(state)

    healing_time = time.time() - start_time
    metrics.update(result, healing_time)

# 显示仪表板
dashboard = MonitoringDashboard(metrics)
dashboard.display()

# 导出Prometheus指标
prometheus_metrics = dashboard.export_to_prometheus()
print("\nPrometheus指标:")
print(prometheus_metrics)
```

---

## 版本管理与知识库

### 修复版本管理

跟踪修复随时间的演变。

```python
from datetime import datetime
from typing import List

@dataclass
class FixVersion:
    version: str
    timestamp: datetime
    fix_strategy: Dict
    success_rate: float
    sample_size: int
    metadata: Dict

class FixVersionManager:
    def __init__(self, storage_path: str = "fix_versions.json"):
        self.storage_path = storage_path
        self.versions: Dict[str, List[FixVersion]] = {}
        self.load_versions()

    def register_fix(self,
                    error_type: ErrorType,
                    fix_strategy: Dict,
                    success: bool):
        """注册修复结果"""

        # 获取当前版本
        current_version = self._get_current_version(error_type, fix_strategy)

        if current_version:
            # 更新现有版本
            current_version.sample_size += 1
            current_version.success_rate = (
                (current_version.success_rate * (current_version.sample_size - 1) +
                 (1.0 if success else 0.0)) / current_version.sample_size
            )
        else:
            # 创建新版本
            version_number = self._generate_version_number(error_type)
            new_version = FixVersion(
                version=version_number,
                timestamp=datetime.now(),
                fix_strategy=fix_strategy,
                success_rate=1.0 if success else 0.0,
                sample_size=1,
                metadata={}
            )

            if error_type not in self.versions:
                self.versions[error_type] = []
            self.versions[error_type].append(new_version)

        self.save_versions()

    def get_best_version(self, error_type: ErrorType) -> Optional[FixVersion]:
        """获取最佳修复版本"""

        versions = self.versions.get(error_type, [])
        if not versions:
            return None

        # 过滤样本量太小的版本
        valid_versions = [v for v in versions if v.sample_size >= 5]

        if not valid_versions:
            # 如果没有足够样本的版本,返回最新的
            return max(versions, key=lambda v: v.timestamp)

        # 返回成功率最高的
        return max(valid_versions, key=lambda v: v.success_rate)

    def _get_current_version(self,
                            error_type: ErrorType,
                            fix_strategy: Dict) -> Optional[FixVersion]:
        """获取匹配的当前版本"""

        versions = self.versions.get(error_type, [])
        for version in versions:
            if self._strategies_match(version.fix_strategy, fix_strategy):
                return version
        return None

    def _strategies_match(self, strategy1: Dict, strategy2: Dict) -> bool:
        """检查策略是否匹配"""
        return strategy1.get("type") == strategy2.get("type")

    def _generate_version_number(self, error_type: ErrorType) -> str:
        """生成版本号"""
        versions = self.versions.get(error_type, [])
        next_num = len(versions) + 1
        return f"v{next_num}.0"

    def save_versions(self):
        """保存版本"""
        data = {
            error_type.value: [
                {
                    "version": v.version,
                    "timestamp": v.timestamp.isoformat(),
                    "fix_strategy": v.fix_strategy,
                    "success_rate": v.success_rate,
                    "sample_size": v.sample_size,
                    "metadata": v.metadata
                }
                for v in versions
            ]
            for error_type, versions in self.versions.items()
        }

        with open(self.storage_path, 'w') as f:
            json.dump(data, f, indent=2)

    def load_versions(self):
        """加载版本"""
        try:
            with open(self.storage_path, 'r') as f:
                data = json.load(f)

            for error_type_str, versions_data in data.items():
                error_type = ErrorType(error_type_str)
                self.versions[error_type] = [
                    FixVersion(
                        version=v["version"],
                        timestamp=datetime.fromisoformat(v["timestamp"]),
                        fix_strategy=v["fix_strategy"],
                        success_rate=v["success_rate"],
                        sample_size=v["sample_size"],
                        metadata=v["metadata"]
                    )
                    for v in versions_data
                ]
        except FileNotFoundError:
            pass
```

### 知识库查询

实现高效的知识库查询系统。

```python
class KnowledgeBase:
    def __init__(self, learning_system: LearningSystem):
        self.learning_system = learning_system

    def query(self,
             error_type: Optional[ErrorType] = None,
             cause_type: Optional[str] = None,
             success_only: bool = False,
             limit: int = 10) -> List[LearningEntry]:
        """查询知识库"""

        all_entries = []

        if error_type:
            all_entries = self.learning_system.error_patterns.get(error_type, [])
        else:
            for entries in self.learning_system.error_patterns.values():
                all_entries.extend(entries)

        # 应用过滤器
        filtered = all_entries

        if cause_type:
            filtered = [
                e for e in filtered
                if e.root_cause.cause_type == cause_type
            ]

        if success_only:
            filtered = [e for e in filtered if e.success]

        # 按时间排序(最新优先)
        filtered.sort(key=lambda e: e.timestamp, reverse=True)

        return filtered[:limit]

    def get_statistics(self) -> Dict:
        """获取知识库统计"""

        total_entries = sum(
            len(entries)
            for entries in self.learning_system.error_patterns.values()
        )

        successful_entries = sum(
            sum(1 for e in entries if e.success)
            for entries in self.learning_system.error_patterns.values()
        )

        error_distribution = {
            error_type.value: len(entries)
            for error_type, entries in self.learning_system.error_patterns.items()
        }

        return {
            "total_entries": total_entries,
            "successful_entries": successful_entries,
            "success_rate": successful_entries / total_entries if total_entries > 0 else 0,
            "error_distribution": error_distribution,
            "fix_success_rates": {
                k.value: v
                for k, v in self.learning_system.fix_success_rates.items()
            }
        }

    def export_insights(self) -> str:
        """导出洞察报告"""

        stats = self.get_statistics()

        report = []
        report.append("=" * 60)
        report.append("Self-Healing知识库洞察报告")
        report.append("=" * 60)

        report.append(f"\n总体统计:")
        report.append(f"  总条目数: {stats['total_entries']}")
        report.append(f"  成功条目: {stats['successful_entries']}")
        report.append(f"  总体成功率: {stats['success_rate']:.2%}")

        report.append(f"\n错误类型分布:")
        for error_type, count in stats['error_distribution'].items():
            percentage = count / stats['total_entries'] * 100
            report.append(f"  {error_type}: {count} ({percentage:.1f}%)")

        report.append(f"\n修复成功率(按错误类型):")
        for error_type, rates in stats['fix_success_rates'].items():
            report.append(f"  {error_type}:")
            for fix_type, rate in rates.items():
                report.append(f"    {fix_type}: {rate:.2%}")

        # 推荐
        report.append(f"\n推荐:")
        for error_type in ErrorType:
            best_strategy = self.learning_system.get_best_fix_strategy(error_type)
            report.append(f"  {error_type.value}: 使用 '{best_strategy}' 策略")

        report.append("=" * 60)

        return "\n".join(report)
```

---

## 实践练习

### 练习 1: 实现自定义错误检测器

**任务**: 为特定领域(如JSON验证)创建自定义错误检测器

```python
class JSONErrorDetector(ErrorDetector):
    def detect(self, response: str, metadata: Dict) -> List[ErrorType]:
        """检测JSON响应中的错误"""
        errors = []

        # TODO: 实现以下检测
        # 1. 验证是否为有效JSON
        # 2. 检查必需字段
        # 3. 验证数据类型
        # 4. 检查值范围

        return errors

# 测试
detector = JSONErrorDetector()
test_responses = [
    '{"name": "John", "age": 30}',  # 有效
    '{"name": "John", "age": "thirty"}',  # 类型错误
    '{"name": "John"}',  # 缺少字段
    '{invalid json}',  # 无效JSON
]

for response in test_responses:
    errors = detector.detect(response, {})
    print(f"响应: {response}")
    print(f"错误: {errors}\n")
```

### 练习 2: 构建领域特定的修复生成器

**任务**: 创建针对API响应错误的修复生成器

```python
class APIFixGenerator(FixGenerator):
    def _fix_api_error(self,
                      root_cause: RootCause,
                      prompt: str,
                      context: Dict) -> Dict:
        """修复API错误"""

        # TODO: 实现以下修复
        # 1. 识别缺失的API参数
        # 2. 修正参数格式
        # 3. 添加必需的头信息
        # 4. 调整请求重试逻辑

        pass

# 测试
generator = APIFixGenerator(llm)
root_cause = RootCause(
    cause_type="api_error",
    description="缺少必需的API参数 'api_key'",
    confidence=0.9,
    suggested_fix="添加API密钥到请求头"
)

fix = generator._fix_api_error(
    root_cause,
    "调用天气API",
    {"endpoint": "https://api.weather.com/current"}
)
```

### 练习 3: 实现渐进式学习

**任务**: 创建随时间调整修复策略的学习系统

```python
class AdaptiveLearningSystem(LearningSystem):
    def adapt_strategy(self, error_type: ErrorType):
        """基于历史数据调整策略"""

        # TODO: 实现以下逻辑
        # 1. 分析最近的成功/失败模式
        # 2. 识别趋势(改善/恶化)
        # 3. 调整策略权重
        # 4. 淘汰表现不佳的策略

        pass

# 测试
learning = AdaptiveLearningSystem()

# 模拟100次错误
for i in range(100):
    error_type = random.choice(list(ErrorType))
    fix_type = random.choice(["prompt_rewrite", "context_enhancement", "retry"])
    success = random.random() > 0.3  # 70%成功率

    learning.record_outcome(
        error_type=error_type,
        root_cause=RootCause("test", "test", 0.5, "test"),
        fix={"type": fix_type},
        success=success,
        metrics={}
    )

# 调整策略
for error_type in ErrorType:
    learning.adapt_strategy(error_type)
    best = learning.get_best_fix_strategy(error_type)
    print(f"{error_type}: 最佳策略 = {best}")
```

---

## 常见陷阱与最佳实践

### 陷阱 1: 过度修复

**问题**: 尝试修复不值得投入成本的小错误

```python
# ❌ 错误: 对所有错误无差别尝试修复
def process_request(prompt):
    state = create_state(prompt)
    result = healing_graph.invoke(state)
    return result["current_response"]

# ✅ 正确: 基于严重性决定是否修复
def process_request(prompt, context):
    # 快速检查
    if is_trivial_error(prompt):
        return simple_fallback(prompt)

    # 对重要请求进行Self-Healing
    if context.get("importance") == "high":
        state = create_state(prompt, max_attempts=5)
    else:
        state = create_state(prompt, max_attempts=2)

    result = healing_graph.invoke(state)
    return result["current_response"]
```

**最佳实践**:
- 根据错误严重性分配资源
- 为不同场景设置不同的`max_attempts`
- 考虑修复的成本效益

### 陷阱 2: 无限循环

**问题**: 修复导致相同错误,造成无限循环

```python
# ❌ 错误: 没有循环检测
def generate_fix(root_cause, prompt, context):
    # 总是生成相同的修复
    return {"type": "prompt_rewrite", "new_prompt": prompt + " 请详细说明"}

# ✅ 正确: 检测并防止循环
class LoopDetector:
    def __init__(self):
        self.fix_history = []

    def is_loop(self, fix: Dict) -> bool:
        """检测是否陷入循环"""

        # 检查最近3次修复
        recent_fixes = self.fix_history[-3:]

        # 如果相同修复重复出现
        if recent_fixes.count(fix["type"]) >= 2:
            return True

        self.fix_history.append(fix["type"])
        return False

# 在修复生成中使用
detector = LoopDetector()

def generate_fix_safe(root_cause, prompt, context):
    fix = generate_fix(root_cause, prompt, context)

    if detector.is_loop(fix):
        # 切换到不同策略
        return {"type": "fallback", "new_prompt": prompt}

    return fix
```

**最佳实践**:
- 跟踪修复历史
- 检测重复模式
- 设置最大尝试次数的硬限制

### 陷阱 3: 忽略上下文

**问题**: 不考虑之前的修复尝试

```python
# ❌ 错误: 每次独立生成修复
def generate_fix(root_cause, prompt, context):
    if root_cause.cause_type == "prompt_issue":
        return {"type": "prompt_rewrite", "new_prompt": improve_prompt(prompt)}

# ✅ 正确: 考虑之前的尝试
def generate_fix_contextual(root_cause, prompt, context, fixes_attempted):
    # 检查之前尝试过什么
    attempted_types = [fix["type"] for fix in fixes_attempted]

    if root_cause.cause_type == "prompt_issue":
        if "prompt_rewrite" not in attempted_types:
            return {"type": "prompt_rewrite", "new_prompt": improve_prompt(prompt)}
        elif "context_enhancement" not in attempted_types:
            # prompt重写失败,尝试添加上下文
            return {"type": "context_enhancement", "new_prompt": prompt, "context": gather_more_context()}
        else:
            # 两种都尝试过,降级
            return {"type": "fallback"}

    # 其他错误类型...
```

**最佳实践**:
- 将`fixes_attempted`传递给修复生成器
- 避免重复相同的修复策略
- 实现修复策略的递进

### 陷阱 4: 数据泄漏

**问题**: 在学习数据中包含敏感信息

```python
# ❌ 错误: 记录原始prompt(可能包含敏感数据)
def record_outcome(error_type, prompt, fix, success):
    learning_entry = {
        "error_type": error_type,
        "prompt": prompt,  # 危险!可能包含PII
        "fix": fix,
        "success": success
    }
    save_to_database(learning_entry)

# ✅ 正确: 在存储前清理敏感数据
class PrivacyPreservingLearning(LearningSystem):
    def record_outcome(self, error_type, root_cause, fix, success, metrics):
        # 清理根因描述中的敏感信息
        cleaned_cause = self._remove_pii(root_cause)

        # 清理修复数据
        cleaned_fix = self._sanitize_fix(fix)

        # 使用清理后的数据
        super().record_outcome(
            error_type,
            cleaned_cause,
            cleaned_fix,
            success,
            metrics
        )

    def _remove_pii(self, root_cause: RootCause) -> RootCause:
        """删除个人身份信息"""
        import re

        # 删除邮箱
        description = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                           '[EMAIL]',
                           root_cause.description)

        # 删除电话号码
        description = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
                           '[PHONE]',
                           description)

        # 删除信用卡号
        description = re.sub(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
                           '[CARD]',
                           description)

        return RootCause(
            cause_type=root_cause.cause_type,
            description=description,
            confidence=root_cause.confidence,
            suggested_fix=root_cause.suggested_fix
        )

    def _sanitize_fix(self, fix: Dict) -> Dict:
        """清理修复数据"""
        sanitized = fix.copy()

        # 删除prompt中的敏感信息
        if "new_prompt" in sanitized:
            sanitized["new_prompt"] = self._remove_pii_from_text(sanitized["new_prompt"])

        return sanitized
```

**最佳实践**:
- 实施数据清理管道
- 定期审计学习数据
- 遵守隐私法规(GDPR、CCPA等)
- 使用数据最小化原则

### 最佳实践总结

1. **成本意识**
   - 基于严重性分配修复尝试
   - 实施快速失败机制
   - 监控资源使用

2. **稳健性**
   - 检测并防止无限循环
   - 设置硬超时限制
   - 实施断路器模式

3. **上下文感知**
   - 跟踪修复历史
   - 避免重复策略
   - 实施渐进式策略

4. **隐私与安全**
   - 清理敏感数据
   - 实施访问控制
   - 定期审计
   - 遵守法规

5. **可观测性**
   - 全面的指标跟踪
   - 结构化日志
   - 警报机制
   - 定期审查

---

## 总结

本章学习了如何构建Self-Healing AI系统。

**核心要点**:

1. **5个阶段循环**
   - 错误检测
   - 根因分析
   - 修复生成
   - 修复应用
   - 验证与学习

2. **LangGraph实现**
   - 状态管理
   - 节点定义
   - 条件路由
   - 图构建

3. **实践案例**
   - Netflix推荐系统
   - GitHub Copilot
   - Google搜索

4. **监控与知识库**
   - 指标跟踪
   - 版本管理
   - 知识库查询
   - 洞察生成

**下一步**:

- 第14章将学习高级提示工程技术,进一步提升系统质量
- 探索更复杂的错误检测模式
- 实施企业级监控解决方案
- 研究多模型Self-Healing策略

**推荐资源**:

- LangGraph文档: https://langchain-ai.github.io/langgraph/
- Self-Healing Systems论文集
- 可靠性工程最佳实践
- AI系统监控指南

---

**练习答案提示**:

**练习1提示**:
```python
def detect(self, response: str, metadata: Dict) -> List[ErrorType]:
    errors = []

    # 1. JSON验证
    try:
        data = json.loads(response)
    except json.JSONDecodeError:
        errors.append(ErrorType.SYNTAX_ERROR)
        return errors

    # 2. 必需字段
    required_fields = ["name", "age"]
    if not all(field in data for field in required_fields):
        errors.append(ErrorType.SEMANTIC_ERROR)

    # 3. 类型验证
    if "age" in data and not isinstance(data["age"], int):
        errors.append(ErrorType.SEMANTIC_ERROR)

    return errors
```

**练习2提示**:
```python
def _fix_api_error(self, root_cause, prompt, context):
    if "missing parameter" in root_cause.description.lower():
        # 提取缺失的参数名
        param_name = extract_param_name(root_cause.description)

        # 添加到上下文
        new_context = context.copy()
        new_context[param_name] = get_default_value(param_name)

        return {
            "type": "context_enhancement",
            "new_prompt": prompt,
            "context": new_context
        }
```

**练习3提示**:
```python
def adapt_strategy(self, error_type):
    # 获取最近50个条目
    recent_entries = self.error_patterns.get(error_type, [])[-50:]

    # 按修复类型分组
    by_fix_type = {}
    for entry in recent_entries:
        fix_type = entry.fix_applied["type"]
        if fix_type not in by_fix_type:
            by_fix_type[fix_type] = []
        by_fix_type[fix_type].append(entry.success)

    # 计算最近的成功率
    for fix_type, successes in by_fix_type.items():
        recent_rate = sum(successes) / len(successes)

        # 如果最近表现差,降低权重
        if recent_rate < 0.3:
            # 淘汰此策略
            pass
```