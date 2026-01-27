## Classes

<dl>
<dt><a href="#RandomAgent">RandomAgent</a> ⇐ <code><a href="#Agent">Agent</a></code></dt>
<dd></dd>
<dt><a href="#RuleBasedAgent">RuleBasedAgent</a> ⇐ <code><a href="#Agent">Agent</a></code></dt>
<dd></dd>
<dt><a href="#RuleBasedAgent">RuleBasedAgent</a></dt>
<dd></dd>
<dt><a href="#AlgorithmRunner">AlgorithmRunner</a></dt>
<dd></dd>
<dt><a href="#AlgorithmRunner">AlgorithmRunner</a></dt>
<dd></dd>
<dt><a href="#Arena">Arena</a></dt>
<dd></dd>
<dt><a href="#Arena">Arena</a></dt>
<dd></dd>
<dt><a href="#RuleNode">RuleNode</a></dt>
<dd><p>Abstrakte Basisklasse für alle Regel-Knoten.</p>
</dd>
<dt><a href="#AtomicRule">AtomicRule</a></dt>
<dd><p>Eine atomare Regel, die einen Zug vorschlägt (Blatt im Baum).</p>
</dd>
<dt><a href="#RuleGroup">RuleGroup</a></dt>
<dd><p>Eine Gruppe von Regeln. Geht die Kinder der Reihe nach durch (Priorität).
Das erste Kind, das einen Zug liefert, gewinnt.</p>
</dd>
<dt><a href="#ConditionNode">ConditionNode</a></dt>
<dd><p>Ein Verzweigungsknoten (If-Then-Else).
Ermöglicht echte Entscheidungsbäume statt nur Listen.</p>
</dd>
<dt><a href="#DecisionTree">DecisionTree</a></dt>
<dd><p>Wrapper für den gesamten Baum.</p>
</dd>
<dt><a href="#SearchEngine">SearchEngine</a></dt>
<dd></dd>
<dt><a href="#SearchEngine">SearchEngine</a></dt>
<dd></dd>
<dt><a href="#Agent">Agent</a></dt>
<dd><p>Abstrakte Basisklasse für alle KI-Agenten.
Ein Agent erhält einen Spielzustand und muss einen Zug zurückgeben.</p>
<ul>
<li>@abstract</li>
</ul>
</dd>
<dt><a href="#GameState">GameState</a></dt>
<dd><p>Interface für einen Spielzustand.
Jedes Spiel (TicTacToe, RotateBox, KnightsTour) muss dieses Interface implementieren,
damit die KI-Agenten und Suchalgorithmen damit arbeiten können.</p>
<ul>
<li>@interface GameState</li>
</ul>
</dd>
<dt><a href="#KnightBoard">KnightBoard</a></dt>
<dd><p>Repräsentiert das Schachbrett für den Springer.</p>
</dd>
<dt><a href="#RotateBoard">RotateBoard</a></dt>
<dd><p>Repräsentiert das Spielbrett und dessen Zustand.
Implementiert das GameState Interface für die KI.</p>
</dd>
<dt><a href="#TTTBase">TTTBase</a></dt>
<dd><p>Abstrakte Basisklasse für Tic-Tac-Toe Spiele.</p>
</dd>
<dt><a href="#TTTRegularBoard">TTTRegularBoard</a> ⇐ <code><a href="#TTTBase">TTTBase</a></code></dt>
<dd><p>Klassisches 3x3 Tic-Tac-Toe Board.</p>
</dd>
<dt><a href="#TTT3DBoard">TTT3DBoard</a> ⇐ <code><a href="#TTTBase">TTTBase</a></code></dt>
<dd><p>3D Tic-Tac-Toe Board (Würfel).
Unterstützt variable Größen (z.B. 3x3x3 oder 4x4x4).</p>
</dd>
<dt><a href="#UltimateBoard">UltimateBoard</a> ⇐ <code><a href="#TTTBase">TTTBase</a></code></dt>
<dd><p>Ultimate Tic-Tac-Toe.
9 kleine Boards (3x3) in einem großen Board.</p>
</dd>
<dt><a href="#Benchmark">Benchmark</a></dt>
<dd></dd>
<dt><a href="#FlowchartVisualizer">FlowchartVisualizer</a></dt>
<dd></dd>
<dt><a href="#RuleVisualizer">RuleVisualizer</a></dt>
<dd></dd>
<dt><a href="#TreeNode">TreeNode</a></dt>
<dd><p>Repräsentiert einen einzelnen Knoten im Visualisierungsbaum.</p>
</dd>
<dt><a href="#TreeVisualizer">TreeVisualizer</a></dt>
<dd><p>Hauptklasse zur Visualisierung.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#checkSmallWin">checkSmallWin()</a></dt>
<dd><p>Hilfsfunktion für lokalen Sieg</p>
</dd>
<dt><a href="#createStrategyTree">createStrategyTree()</a></dt>
<dd><p>Factory Methode: Erstellt den Baum basierend auf Spieltyp.
Hier nutzen wir jetzt ConditionNodes für echte Verzweigungen!</p>
</dd>
<dt><a href="#drawRotateBoard">drawRotateBoard(board, canvas, ctx)</a></dt>
<dd><p>Zeichnet das Board auf den Canvas.</p>
</dd>
<dt><a href="#animateRelax">animateRelax(board, canvas, ctx, speed, renderCallback)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Animiert das Fallen der Blöcke.</p>
</dd>
<dt><a href="#solveBFS">solveBFS()</a> ⇒ <code>Promise.&lt;({path: Array.&lt;string&gt;, nodes: number}|null)&gt;</code></dt>
<dd><p>Findet den kürzesten Weg mittels Breitensuche (BFS).
Wrapper für SearchEngine, der asynchron läuft um das UI nicht zu blockieren.</p>
<ul>
<li>@param {RotateBoard} startBoard - Der Startzustand.</li>
</ul>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#SearchConfig">SearchConfig</a> : <code>Object</code></dt>
<dd><p>Konfiguration für die Suchmaschine.</p>
</dd>
</dl>

<a name="RandomAgent"></a>

## RandomAgent ⇐ [<code>Agent</code>](#Agent)
**Kind**: global class  
**Extends**: [<code>Agent</code>](#Agent)  

* [RandomAgent](#RandomAgent) ⇐ [<code>Agent</code>](#Agent)
    * [new RandomAgent()](#new_RandomAgent_new)
    * [.getAction(gameState)](#RandomAgent+getAction) ⇒ <code>Object</code> \| <code>null</code>

<a name="new_RandomAgent_new"></a>

### new RandomAgent()
Ein Agent, der zufällige gültige Züge macht.
Dient oft als Baseline für Vergleiche.

<a name="RandomAgent+getAction"></a>

### randomAgent.getAction(gameState) ⇒ <code>Object</code> \| <code>null</code>
Wählt zufällig einen der gültigen Züge.

**Kind**: instance method of [<code>RandomAgent</code>](#RandomAgent)  
**Overrides**: [<code>getAction</code>](#Agent+getAction)  

| Param | Type |
| --- | --- |
| gameState | [<code>GameState</code>](#GameState) | 

<a name="RuleBasedAgent"></a>

## RuleBasedAgent ⇐ [<code>Agent</code>](#Agent)
**Kind**: global class  
**Extends**: [<code>Agent</code>](#Agent)  

* [RuleBasedAgent](#RuleBasedAgent) ⇐ [<code>Agent</code>](#Agent)
    * [new RuleBasedAgent()](#new_RuleBasedAgent_new)
    * [new RuleBasedAgent(tree)](#new_RuleBasedAgent_new)
    * [.getAction(gameState)](#RuleBasedAgent+getAction) ⇒ <code>Object</code> \| <code>null</code>

<a name="new_RuleBasedAgent_new"></a>

### new RuleBasedAgent()
Ein Agent, der Entscheidungen basierend auf einem Entscheidungsbaum trifft.

<a name="new_RuleBasedAgent_new"></a>

### new RuleBasedAgent(tree)

| Param | Type | Description |
| --- | --- | --- |
| tree | [<code>DecisionTree</code>](#DecisionTree) | Der Regelbaum (siehe rule-structure.js). |

<a name="RuleBasedAgent+getAction"></a>

### ruleBasedAgent.getAction(gameState) ⇒ <code>Object</code> \| <code>null</code>
Delegiert die Entscheidung an den Baum.

**Kind**: instance method of [<code>RuleBasedAgent</code>](#RuleBasedAgent)  
**Overrides**: [<code>getAction</code>](#Agent+getAction)  
**Returns**: <code>Object</code> \| <code>null</code> - Das Ergebnis des Baums.  

| Param | Type |
| --- | --- |
| gameState | [<code>GameState</code>](#GameState) | 

<a name="RuleBasedAgent"></a>

## RuleBasedAgent
**Kind**: global class  

* [RuleBasedAgent](#RuleBasedAgent)
    * [new RuleBasedAgent()](#new_RuleBasedAgent_new)
    * [new RuleBasedAgent(tree)](#new_RuleBasedAgent_new)
    * [.getAction(gameState)](#RuleBasedAgent+getAction) ⇒ <code>Object</code> \| <code>null</code>

<a name="new_RuleBasedAgent_new"></a>

### new RuleBasedAgent()
Ein Agent, der Entscheidungen basierend auf einem Entscheidungsbaum trifft.

<a name="new_RuleBasedAgent_new"></a>

### new RuleBasedAgent(tree)

| Param | Type | Description |
| --- | --- | --- |
| tree | [<code>DecisionTree</code>](#DecisionTree) | Der Regelbaum (siehe rule-structure.js). |

<a name="RuleBasedAgent+getAction"></a>

### ruleBasedAgent.getAction(gameState) ⇒ <code>Object</code> \| <code>null</code>
Delegiert die Entscheidung an den Baum.

**Kind**: instance method of [<code>RuleBasedAgent</code>](#RuleBasedAgent)  
**Overrides**: [<code>getAction</code>](#Agent+getAction)  
**Returns**: <code>Object</code> \| <code>null</code> - Das Ergebnis des Baums.  

| Param | Type |
| --- | --- |
| gameState | [<code>GameState</code>](#GameState) | 

<a name="AlgorithmRunner"></a>

## AlgorithmRunner
**Kind**: global class  

* [AlgorithmRunner](#AlgorithmRunner)
    * [new AlgorithmRunner()](#new_AlgorithmRunner_new)
    * [new AlgorithmRunner(engine, config)](#new_AlgorithmRunner_new)
    * [.start(startState)](#AlgorithmRunner+start)
    * [.stop()](#AlgorithmRunner+stop)
    * [.triggerStep()](#AlgorithmRunner+triggerStep)
    * [.setSpeed(val)](#AlgorithmRunner+setSpeed)

<a name="new_AlgorithmRunner_new"></a>

### new AlgorithmRunner()
Wrapper um die SearchEngine, der "Schritt-für-Schritt" Ausführung
und manuelle Steuerung (Play/Pause/Step) ermöglicht.

<a name="new_AlgorithmRunner_new"></a>

### new AlgorithmRunner(engine, config)

| Param | Type | Description |
| --- | --- | --- |
| engine | [<code>SearchEngine</code>](#SearchEngine) | Die konfigurierte Suchmaschine. |
| config | <code>Object</code> | Callbacks für UI. |
| config.onUpdate | <code>function</code> | Wird bei jedem Schritt gerufen. |
| config.onComplete | <code>function</code> | Wird bei Ende gerufen. |

<a name="AlgorithmRunner+start"></a>

### algorithmRunner.start(startState)
Startet den Runner.

**Kind**: instance method of [<code>AlgorithmRunner</code>](#AlgorithmRunner)  

| Param | Type |
| --- | --- |
| startState | [<code>GameState</code>](#GameState) | 

<a name="AlgorithmRunner+stop"></a>

### algorithmRunner.stop()
Stoppt den aktuellen Lauf.

**Kind**: instance method of [<code>AlgorithmRunner</code>](#AlgorithmRunner)  
<a name="AlgorithmRunner+triggerStep"></a>

### algorithmRunner.triggerStep()
Führt im manuellen Modus genau einen Schritt aus.

**Kind**: instance method of [<code>AlgorithmRunner</code>](#AlgorithmRunner)  
<a name="AlgorithmRunner+setSpeed"></a>

### algorithmRunner.setSpeed(val)
Setzt die Geschwindigkeit.

**Kind**: instance method of [<code>AlgorithmRunner</code>](#AlgorithmRunner)  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>number</code> \| <code>string</code> | Wert vom Slider (0-6). 6 = Manuell. |

<a name="AlgorithmRunner"></a>

## AlgorithmRunner
**Kind**: global class  

* [AlgorithmRunner](#AlgorithmRunner)
    * [new AlgorithmRunner()](#new_AlgorithmRunner_new)
    * [new AlgorithmRunner(engine, config)](#new_AlgorithmRunner_new)
    * [.start(startState)](#AlgorithmRunner+start)
    * [.stop()](#AlgorithmRunner+stop)
    * [.triggerStep()](#AlgorithmRunner+triggerStep)
    * [.setSpeed(val)](#AlgorithmRunner+setSpeed)

<a name="new_AlgorithmRunner_new"></a>

### new AlgorithmRunner()
Wrapper um die SearchEngine, der "Schritt-für-Schritt" Ausführung
und manuelle Steuerung (Play/Pause/Step) ermöglicht.

<a name="new_AlgorithmRunner_new"></a>

### new AlgorithmRunner(engine, config)

| Param | Type | Description |
| --- | --- | --- |
| engine | [<code>SearchEngine</code>](#SearchEngine) | Die konfigurierte Suchmaschine. |
| config | <code>Object</code> | Callbacks für UI. |
| config.onUpdate | <code>function</code> | Wird bei jedem Schritt gerufen. |
| config.onComplete | <code>function</code> | Wird bei Ende gerufen. |

<a name="AlgorithmRunner+start"></a>

### algorithmRunner.start(startState)
Startet den Runner.

**Kind**: instance method of [<code>AlgorithmRunner</code>](#AlgorithmRunner)  

| Param | Type |
| --- | --- |
| startState | [<code>GameState</code>](#GameState) | 

<a name="AlgorithmRunner+stop"></a>

### algorithmRunner.stop()
Stoppt den aktuellen Lauf.

**Kind**: instance method of [<code>AlgorithmRunner</code>](#AlgorithmRunner)  
<a name="AlgorithmRunner+triggerStep"></a>

### algorithmRunner.triggerStep()
Führt im manuellen Modus genau einen Schritt aus.

**Kind**: instance method of [<code>AlgorithmRunner</code>](#AlgorithmRunner)  
<a name="AlgorithmRunner+setSpeed"></a>

### algorithmRunner.setSpeed(val)
Setzt die Geschwindigkeit.

**Kind**: instance method of [<code>AlgorithmRunner</code>](#AlgorithmRunner)  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>number</code> \| <code>string</code> | Wert vom Slider (0-6). 6 = Manuell. |

<a name="Arena"></a>

## Arena
**Kind**: global class  

* [Arena](#Arena)
    * [new Arena()](#new_Arena_new)
    * [new Arena(gameFactory, agent1, agent2)](#new_Arena_new)
    * [.runSeries(rounds)](#Arena+runSeries) ⇒ <code>Promise.&lt;Object&gt;</code>

<a name="new_Arena_new"></a>

### new Arena()
Controller für KI-gegen-KI Simulationen.

<a name="new_Arena_new"></a>

### new Arena(gameFactory, agent1, agent2)

| Param | Type | Description |
| --- | --- | --- |
| gameFactory | <code>Object</code> | Objekt mit .create() Methode für neue Spiele. |
| agent1 | [<code>Agent</code>](#Agent) | Agent für Spieler 1. |
| agent2 | [<code>Agent</code>](#Agent) | Agent für Spieler 2. |

<a name="Arena+runSeries"></a>

### arena.runSeries(rounds) ⇒ <code>Promise.&lt;Object&gt;</code>
Führt eine Serie von Spielen aus.
Asynchron, um den Browser nicht zu blockieren (Bugfix).

**Kind**: instance method of [<code>Arena</code>](#Arena)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Statistiken und Dauer.  

| Param | Type | Description |
| --- | --- | --- |
| rounds | <code>number</code> | Anzahl der Spiele. |

<a name="Arena"></a>

## Arena
**Kind**: global class  

* [Arena](#Arena)
    * [new Arena()](#new_Arena_new)
    * [new Arena(gameFactory, agent1, agent2)](#new_Arena_new)
    * [.runSeries(rounds)](#Arena+runSeries) ⇒ <code>Promise.&lt;Object&gt;</code>

<a name="new_Arena_new"></a>

### new Arena()
Controller für KI-gegen-KI Simulationen.

<a name="new_Arena_new"></a>

### new Arena(gameFactory, agent1, agent2)

| Param | Type | Description |
| --- | --- | --- |
| gameFactory | <code>Object</code> | Objekt mit .create() Methode für neue Spiele. |
| agent1 | [<code>Agent</code>](#Agent) | Agent für Spieler 1. |
| agent2 | [<code>Agent</code>](#Agent) | Agent für Spieler 2. |

<a name="Arena+runSeries"></a>

### arena.runSeries(rounds) ⇒ <code>Promise.&lt;Object&gt;</code>
Führt eine Serie von Spielen aus.
Asynchron, um den Browser nicht zu blockieren (Bugfix).

**Kind**: instance method of [<code>Arena</code>](#Arena)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Statistiken und Dauer.  

| Param | Type | Description |
| --- | --- | --- |
| rounds | <code>number</code> | Anzahl der Spiele. |

<a name="RuleNode"></a>

## RuleNode
Abstrakte Basisklasse für alle Regel-Knoten.

**Kind**: global class  

* [RuleNode](#RuleNode)
    * [new RuleNode(name, description)](#new_RuleNode_new)
    * [.evaluate(gameState)](#RuleNode+evaluate) ⇒ <code>Object</code> \| <code>null</code>

<a name="new_RuleNode_new"></a>

### new RuleNode(name, description)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Anzeigename der Regel. |
| description | <code>string</code> | Tooltip/Beschreibung. |

<a name="RuleNode+evaluate"></a>

### ruleNode.evaluate(gameState) ⇒ <code>Object</code> \| <code>null</code>
Muss von Unterklassen implementiert werden.

**Kind**: instance method of [<code>RuleNode</code>](#RuleNode)  
**Returns**: <code>Object</code> \| <code>null</code> - { move, reason } oder null  

| Param | Type |
| --- | --- |
| gameState | [<code>GameState</code>](#GameState) | 

<a name="AtomicRule"></a>

## AtomicRule
Eine atomare Regel, die einen Zug vorschlägt (Blatt im Baum).

**Kind**: global class  
<a name="new_AtomicRule_new"></a>

### new AtomicRule(name, description, logicFn)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> |  |
| description | <code>string</code> |  |
| logicFn | <code>function</code> | Gibt Zug oder null zurück. |

<a name="RuleGroup"></a>

## RuleGroup
Eine Gruppe von Regeln. Geht die Kinder der Reihe nach durch (Priorität).
Das erste Kind, das einen Zug liefert, gewinnt.

**Kind**: global class  
<a name="ConditionNode"></a>

## ConditionNode
Ein Verzweigungsknoten (If-Then-Else).
Ermöglicht echte Entscheidungsbäume statt nur Listen.

**Kind**: global class  
<a name="new_ConditionNode_new"></a>

### new ConditionNode(name, description, conditionFn, thenNode, elseNode)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> |  |
| description | <code>string</code> |  |
| conditionFn | <code>function</code> | Prüft Bedingung. |
| thenNode | [<code>RuleNode</code>](#RuleNode) | Wird ausgeführt, wenn true. |
| elseNode | [<code>RuleNode</code>](#RuleNode) | Wird ausgeführt, wenn false. |

<a name="DecisionTree"></a>

## DecisionTree
Wrapper für den gesamten Baum.

**Kind**: global class  
<a name="SearchEngine"></a>

## SearchEngine
**Kind**: global class  

* [SearchEngine](#SearchEngine)
    * [new SearchEngine()](#new_SearchEngine_new)
    * [new SearchEngine(config)](#new_SearchEngine_new)
    * [.solve(startState)](#SearchEngine+solve) ⇒ <code>Promise.&lt;{success: boolean, path: Array, nodesVisited: number, stopped: boolean}&gt;</code>

<a name="new_SearchEngine_new"></a>

### new SearchEngine()
Führt Suchalgorithmen auf Zustandsräumen aus.

<a name="new_SearchEngine_new"></a>

### new SearchEngine(config)

| Param | Type |
| --- | --- |
| config | [<code>SearchConfig</code>](#SearchConfig) | 

<a name="SearchEngine+solve"></a>

### searchEngine.solve(startState) ⇒ <code>Promise.&lt;{success: boolean, path: Array, nodesVisited: number, stopped: boolean}&gt;</code>
Startet die Suche nach einem Zielzustand.

**Kind**: instance method of [<code>SearchEngine</code>](#SearchEngine)  

| Param | Type |
| --- | --- |
| startState | [<code>GameState</code>](#GameState) | 

<a name="SearchEngine"></a>

## SearchEngine
**Kind**: global class  

* [SearchEngine](#SearchEngine)
    * [new SearchEngine()](#new_SearchEngine_new)
    * [new SearchEngine(config)](#new_SearchEngine_new)
    * [.solve(startState)](#SearchEngine+solve) ⇒ <code>Promise.&lt;{success: boolean, path: Array, nodesVisited: number, stopped: boolean}&gt;</code>

<a name="new_SearchEngine_new"></a>

### new SearchEngine()
Führt Suchalgorithmen auf Zustandsräumen aus.

<a name="new_SearchEngine_new"></a>

### new SearchEngine(config)

| Param | Type |
| --- | --- |
| config | [<code>SearchConfig</code>](#SearchConfig) | 

<a name="SearchEngine+solve"></a>

### searchEngine.solve(startState) ⇒ <code>Promise.&lt;{success: boolean, path: Array, nodesVisited: number, stopped: boolean}&gt;</code>
Startet die Suche nach einem Zielzustand.

**Kind**: instance method of [<code>SearchEngine</code>](#SearchEngine)  

| Param | Type |
| --- | --- |
| startState | [<code>GameState</code>](#GameState) | 

<a name="Agent"></a>

## Agent
Abstrakte Basisklasse für alle KI-Agenten.
Ein Agent erhält einen Spielzustand und muss einen Zug zurückgeben.
* @abstract

**Kind**: global class  

* [Agent](#Agent)
    * [new Agent([name])](#new_Agent_new)
    * [.getAction(gameState)](#Agent+getAction) ⇒ <code>Object</code> \| <code>null</code>

<a name="new_Agent_new"></a>

### new Agent([name])
Erstellt einen neuen Agenten.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [name] | <code>string</code> | <code>&quot;\&quot;Agent\&quot;&quot;</code> | Der Anzeigename des Agenten. |

<a name="Agent+getAction"></a>

### agent.getAction(gameState) ⇒ <code>Object</code> \| <code>null</code>
Berechnet den nächsten Zug basierend auf dem Spielzustand.

**Kind**: instance method of [<code>Agent</code>](#Agent)  
**Returns**: <code>Object</code> \| <code>null</code> - Ein Objekt `{ move: mixed, reason: string }` oder null, wenn kein Zug möglich ist.  

| Param | Type | Description |
| --- | --- | --- |
| gameState | [<code>GameState</code>](#GameState) | Der aktuelle Zustand des Spiels. |

<a name="GameState"></a>

## GameState
Interface für einen Spielzustand.
Jedes Spiel (TicTacToe, RotateBox, KnightsTour) muss dieses Interface implementieren,
damit die KI-Agenten und Suchalgorithmen damit arbeiten können.
* @interface GameState

**Kind**: global class  

* [GameState](#GameState)
    * [.isGameOver](#GameState+isGameOver) : <code>boolean</code>
    * [.winner](#GameState+winner) : <code>number</code>
    * [.currentPlayer](#GameState+currentPlayer) : <code>number</code>
    * [.getAllValidMoves()](#GameState+getAllValidMoves) ⇒ <code>Array.&lt;(number\|Object)&gt;</code>
    * [.makeMove(move)](#GameState+makeMove) ⇒ <code>boolean</code>
    * [.clone()](#GameState+clone) ⇒ [<code>GameState</code>](#GameState)
    * [.getStateKey()](#GameState+getStateKey) ⇒ <code>string</code>

<a name="GameState+isGameOver"></a>

### gameState.isGameOver : <code>boolean</code>
Gibt an, ob das Spiel beendet ist (Sieg oder Remis).

**Kind**: instance property of [<code>GameState</code>](#GameState)  
<a name="GameState+winner"></a>

### gameState.winner : <code>number</code>
Der Gewinner des Spiels.
0 = Läuft noch / Remis (je nach Kontext), 1 = Spieler 1, 2 = Spieler 2.

**Kind**: instance property of [<code>GameState</code>](#GameState)  
<a name="GameState+currentPlayer"></a>

### gameState.currentPlayer : <code>number</code>
Der Spieler, der aktuell am Zug ist.

**Kind**: instance property of [<code>GameState</code>](#GameState)  
<a name="GameState+getAllValidMoves"></a>

### gameState.getAllValidMoves() ⇒ <code>Array.&lt;(number\|Object)&gt;</code>
Liefert eine Liste aller gültigen Züge im aktuellen Zustand.

**Kind**: instance method of [<code>GameState</code>](#GameState)  
**Returns**: <code>Array.&lt;(number\|Object)&gt;</code> - Ein Array von Zügen (Format hängt vom Spiel ab).  
<a name="GameState+makeMove"></a>

### gameState.makeMove(move) ⇒ <code>boolean</code>
Führt einen Zug aus und aktualisiert den internen Zustand.

**Kind**: instance method of [<code>GameState</code>](#GameState)  
**Returns**: <code>boolean</code> - True, wenn der Zug gültig war und ausgeführt wurde.  

| Param | Type | Description |
| --- | --- | --- |
| move | <code>number</code> \| <code>Object</code> | Der Zug, der ausgeführt werden soll. |

<a name="GameState+clone"></a>

### gameState.clone() ⇒ [<code>GameState</code>](#GameState)
Erstellt eine tiefe Kopie des aktuellen Spielzustands.
Wichtig für KI-Simulationen, damit das echte Brett nicht verändert wird.

**Kind**: instance method of [<code>GameState</code>](#GameState)  
**Returns**: [<code>GameState</code>](#GameState) - Eine exakte Kopie dieses Zustands.  
<a name="GameState+getStateKey"></a>

### gameState.getStateKey() ⇒ <code>string</code>
Generiert einen eindeutigen String für diesen Zustand.
Wird für Caching und Duplikaterkennung in Suchbäumen benötigt.

**Kind**: instance method of [<code>GameState</code>](#GameState)  
**Returns**: <code>string</code> - Der Hash/Key des Zustands.  
<a name="KnightBoard"></a>

## KnightBoard
Repräsentiert das Schachbrett für den Springer.

**Kind**: global class  

* [KnightBoard](#KnightBoard)
    * [new KnightBoard(size)](#new_KnightBoard_new)
    * [.grid](#KnightBoard+grid) : <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
    * [.history](#KnightBoard+history) : <code>Array.&lt;{r:number, c:number}&gt;</code>
    * [.currentPos](#KnightBoard+currentPos) : <code>Object</code> \| <code>null</code>
    * [.initGrid()](#KnightBoard+initGrid)
    * [.isInside(r, c)](#KnightBoard+isInside) ⇒ <code>boolean</code>
    * [.isValidMove(r, c)](#KnightBoard+isValidMove) ⇒ <code>boolean</code>
    * [.move(r, c)](#KnightBoard+move) ⇒ <code>boolean</code>
    * [.undo()](#KnightBoard+undo)
    * [.getPossibleMoves()](#KnightBoard+getPossibleMoves) ⇒ <code>Array.&lt;{r:number, c:number}&gt;</code>
    * [.getDegree(r, c)](#KnightBoard+getDegree) ⇒ <code>number</code>
    * [.isGoal()](#KnightBoard+isGoal)
    * [.getStateKey()](#KnightBoard+getStateKey)
    * [.getNextStates()](#KnightBoard+getNextStates)
    * [.clone()](#KnightBoard+clone) ⇒ [<code>KnightBoard</code>](#KnightBoard)
    * [._getMovesFrom()](#KnightBoard+_getMovesFrom)

<a name="new_KnightBoard_new"></a>

### new KnightBoard(size)

| Param | Type | Description |
| --- | --- | --- |
| size | <code>number</code> \| <code>string</code> | Die Kantenlänge des Brettes (z.B. 5 oder 8). |

<a name="KnightBoard+grid"></a>

### knightBoard.grid : <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
Das Gitter: 0=leer, N=Zugnummer

**Kind**: instance property of [<code>KnightBoard</code>](#KnightBoard)  
<a name="KnightBoard+history"></a>

### knightBoard.history : <code>Array.&lt;{r:number, c:number}&gt;</code>
Historie der Züge

**Kind**: instance property of [<code>KnightBoard</code>](#KnightBoard)  
<a name="KnightBoard+currentPos"></a>

### knightBoard.currentPos : <code>Object</code> \| <code>null</code>
Aktuelle Position

**Kind**: instance property of [<code>KnightBoard</code>](#KnightBoard)  
<a name="KnightBoard+initGrid"></a>

### knightBoard.initGrid()
Initialisiert das leere Grid.

**Kind**: instance method of [<code>KnightBoard</code>](#KnightBoard)  
<a name="KnightBoard+isInside"></a>

### knightBoard.isInside(r, c) ⇒ <code>boolean</code>
Prüft, ob Koordinaten auf dem Brett liegen.

**Kind**: instance method of [<code>KnightBoard</code>](#KnightBoard)  

| Param | Type | Description |
| --- | --- | --- |
| r | <code>number</code> | Zeile |
| c | <code>number</code> | Spalte |

<a name="KnightBoard+isValidMove"></a>

### knightBoard.isValidMove(r, c) ⇒ <code>boolean</code>
Prüft, ob ein Zug gültig ist (innerhalb und Feld leer).

**Kind**: instance method of [<code>KnightBoard</code>](#KnightBoard)  

| Param | Type |
| --- | --- |
| r | <code>number</code> | 
| c | <code>number</code> | 

<a name="KnightBoard+move"></a>

### knightBoard.move(r, c) ⇒ <code>boolean</code>
Führt einen Zug aus (oder setzt Startfigur).

**Kind**: instance method of [<code>KnightBoard</code>](#KnightBoard)  
**Returns**: <code>boolean</code> - True bei Erfolg.  

| Param | Type |
| --- | --- |
| r | <code>number</code> | 
| c | <code>number</code> | 

<a name="KnightBoard+undo"></a>

### knightBoard.undo()
Macht den letzten Zug rückgängig.

**Kind**: instance method of [<code>KnightBoard</code>](#KnightBoard)  
<a name="KnightBoard+getPossibleMoves"></a>

### knightBoard.getPossibleMoves() ⇒ <code>Array.&lt;{r:number, c:number}&gt;</code>
Liefert alle möglichen Züge von der aktuellen Position.

**Kind**: instance method of [<code>KnightBoard</code>](#KnightBoard)  
<a name="KnightBoard+getDegree"></a>

### knightBoard.getDegree(r, c) ⇒ <code>number</code>
Warnsdorf-Logik: Zählt freie Nachbarn von einer Koordinate aus.

**Kind**: instance method of [<code>KnightBoard</code>](#KnightBoard)  
**Returns**: <code>number</code> - Grad (Anzahl möglicher Weiterzüge)  

| Param | Type |
| --- | --- |
| r | <code>number</code> | 
| c | <code>number</code> | 

<a name="KnightBoard+isGoal"></a>

### knightBoard.isGoal()
KI-Interface: Ist das Ziel erreicht?

**Kind**: instance method of [<code>KnightBoard</code>](#KnightBoard)  
<a name="KnightBoard+getStateKey"></a>

### knightBoard.getStateKey()
KI-Interface: Eindeutiger State-String

**Kind**: instance method of [<code>KnightBoard</code>](#KnightBoard)  
<a name="KnightBoard+getNextStates"></a>

### knightBoard.getNextStates()
KI-Interface: Nachfolgezustände generieren

**Kind**: instance method of [<code>KnightBoard</code>](#KnightBoard)  
<a name="KnightBoard+clone"></a>

### knightBoard.clone() ⇒ [<code>KnightBoard</code>](#KnightBoard)
Erstellt eine tiefe Kopie des Boards.

**Kind**: instance method of [<code>KnightBoard</code>](#KnightBoard)  
<a name="KnightBoard+_getMovesFrom"></a>

### knightBoard.\_getMovesFrom()
Interne Hilfsfunktion für Züge

**Kind**: instance method of [<code>KnightBoard</code>](#KnightBoard)  
<a name="RotateBoard"></a>

## RotateBoard
Repräsentiert das Spielbrett und dessen Zustand.
Implementiert das GameState Interface für die KI.

**Kind**: global class  
**Implements**: [<code>GameState</code>](#GameState)  

* [RotateBoard](#RotateBoard)
    * [new RotateBoard(idOrData)](#new_RotateBoard_new)
    * [.moves](#RotateBoard+moves) : <code>number</code>
    * [.won](#RotateBoard+won) : <code>boolean</code>
    * [.isFalling](#RotateBoard+isFalling) : <code>boolean</code>
    * [.fallOffsets](#RotateBoard+fallOffsets) : <code>Object.&lt;number, number&gt;</code>
    * [.grid](#RotateBoard+grid) : <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
    * [.initFromId(id)](#RotateBoard+initFromId)
    * [.rotate([clockwise])](#RotateBoard+rotate)
    * [.canFall(id)](#RotateBoard+canFall) ⇒ <code>boolean</code>
    * [.moveDown(id)](#RotateBoard+moveDown)
    * [.relaxBoardSync()](#RotateBoard+relaxBoardSync)
    * [.clone()](#RotateBoard+clone) ⇒ [<code>RotateBoard</code>](#RotateBoard)
    * [.getStateKey()](#RotateBoard+getStateKey) ⇒ <code>string</code>
    * [.isGoal()](#RotateBoard+isGoal) ⇒ <code>boolean</code>
    * [.getNextStates()](#RotateBoard+getNextStates) ⇒ <code>Array.&lt;{move: string, state: RotateBoard}&gt;</code>

<a name="new_RotateBoard_new"></a>

### new RotateBoard(idOrData)
Erstellt eine neue Board-Instanz.


| Param | Type | Description |
| --- | --- | --- |
| idOrData | <code>string</code> \| <code>null</code> | Die Level-ID ('0'-'3') oder null (für leeres Board/Klonen). |

<a name="RotateBoard+moves"></a>

### rotateBoard.moves : <code>number</code>
Anzahl der getätigten Züge.

**Kind**: instance property of [<code>RotateBoard</code>](#RotateBoard)  
<a name="RotateBoard+won"></a>

### rotateBoard.won : <code>boolean</code>
Gibt an, ob das Ziel erreicht wurde.

**Kind**: instance property of [<code>RotateBoard</code>](#RotateBoard)  
<a name="RotateBoard+isFalling"></a>

### rotateBoard.isFalling : <code>boolean</code>
Flag für laufende Fall-Animationen.

**Kind**: instance property of [<code>RotateBoard</code>](#RotateBoard)  
<a name="RotateBoard+fallOffsets"></a>

### rotateBoard.fallOffsets : <code>Object.&lt;number, number&gt;</code>
Speichert visuelle Offsets für fallende Boxen.

**Kind**: instance property of [<code>RotateBoard</code>](#RotateBoard)  
<a name="RotateBoard+grid"></a>

### rotateBoard.grid : <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
Das Spielfeld als 2D-Array (-2=Wand, -1=Leer, -3=Ziel, >=0 BoxID).

**Kind**: instance property of [<code>RotateBoard</code>](#RotateBoard)  
<a name="RotateBoard+initFromId"></a>

### rotateBoard.initFromId(id)
Lädt die Leveldaten aus den Strings.
WICHTIG: Die Strings enthalten Leerzeichen, die für das Layout essenziell sind.

**Kind**: instance method of [<code>RotateBoard</code>](#RotateBoard)  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 

<a name="RotateBoard+rotate"></a>

### rotateBoard.rotate([clockwise])
Rotiert das Spielfeld um 90 Grad.
- True für Rechtsdrehung, False für Links.

**Kind**: instance method of [<code>RotateBoard</code>](#RotateBoard)  

| Param | Type | Default |
| --- | --- | --- |
| [clockwise] | <code>boolean</code> | <code>true</code> | 

<a name="RotateBoard+canFall"></a>

### rotateBoard.canFall(id) ⇒ <code>boolean</code>
Prüft, ob eine Box physikalisch fallen kann.
 Die ID der Box.

**Kind**: instance method of [<code>RotateBoard</code>](#RotateBoard)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | True, wenn der Weg nach unten frei ist. |

<a name="RotateBoard+moveDown"></a>

### rotateBoard.moveDown(id)
Bewegt eine Box logisch um ein Feld nach unten.
Die ID der Box.

**Kind**: instance method of [<code>RotateBoard</code>](#RotateBoard)  

| Param | Type |
| --- | --- |
| id | <code>number</code> | 

<a name="RotateBoard+relaxBoardSync"></a>

### rotateBoard.relaxBoardSync()
Lässt alle Boxen fallen, bis sie stabil liegen.
Wird synchron ausgeführt (ohne Animation), z.B. für KI-Vorberechnung.

**Kind**: instance method of [<code>RotateBoard</code>](#RotateBoard)  
<a name="RotateBoard+clone"></a>

### rotateBoard.clone() ⇒ [<code>RotateBoard</code>](#RotateBoard)
Erstellt eine tiefe Kopie des aktuellen Boards.
Die Kopie.

**Kind**: instance method of [<code>RotateBoard</code>](#RotateBoard)  
**Implements**: [<code>clone</code>](#GameState+clone)  
<a name="RotateBoard+getStateKey"></a>

### rotateBoard.getStateKey() ⇒ <code>string</code>
Generiert einen eindeutigen Schlüssel für den Zustand (für HashMaps).
String-Repräsentation des Grids.

**Kind**: instance method of [<code>RotateBoard</code>](#RotateBoard)  
**Implements**: [<code>getStateKey</code>](#GameState+getStateKey)  
<a name="RotateBoard+isGoal"></a>

### rotateBoard.isGoal() ⇒ <code>boolean</code>
Prüft, ob das Spiel gewonnen ist.

**Kind**: instance method of [<code>RotateBoard</code>](#RotateBoard)  
<a name="RotateBoard+getNextStates"></a>

### rotateBoard.getNextStates() ⇒ <code>Array.&lt;{move: string, state: RotateBoard}&gt;</code>
Liefert alle möglichen Nachfolgezustände.

**Kind**: instance method of [<code>RotateBoard</code>](#RotateBoard)  
<a name="TTTBase"></a>

## *TTTBase*
Abstrakte Basisklasse für Tic-Tac-Toe Spiele.

**Kind**: global abstract class  

* *[TTTBase](#TTTBase)*
    * *[.currentPlayer](#TTTBase+currentPlayer) : <code>number</code>*
    * *[.winner](#TTTBase+winner) : <code>number</code>*
    * *[.switchPlayer()](#TTTBase+switchPlayer)*

<a name="TTTBase+currentPlayer"></a>

### *tttBase.currentPlayer : <code>number</code>*
Aktueller Spieler. 
1 = Spieler 1 (Blau/Kreis), 2 = Spieler 2 (Rot/Kreuz).

**Kind**: instance property of [<code>TTTBase</code>](#TTTBase)  
<a name="TTTBase+winner"></a>

### *tttBase.winner : <code>number</code>*
Gewinner des Spiels.
0 = Laufend, 1 = Spieler 1, 2 = Spieler 2, 3 = Remis.

**Kind**: instance property of [<code>TTTBase</code>](#TTTBase)  
<a name="TTTBase+switchPlayer"></a>

### *tttBase.switchPlayer()*
Wechselt den aktiven Spieler (1 -> 2 -> 1).

**Kind**: instance method of [<code>TTTBase</code>](#TTTBase)  
<a name="TTTRegularBoard"></a>

## TTTRegularBoard ⇐ [<code>TTTBase</code>](#TTTBase)
Klassisches 3x3 Tic-Tac-Toe Board.

**Kind**: global class  
**Extends**: [<code>TTTBase</code>](#TTTBase)  

* [TTTRegularBoard](#TTTRegularBoard) ⇐ [<code>TTTBase</code>](#TTTBase)
    * [.grid](#TTTRegularBoard+grid) : <code>Array.&lt;number&gt;</code>
    * [.currentPlayer](#TTTBase+currentPlayer) : <code>number</code>
    * [.winner](#TTTBase+winner) : <code>number</code>
    * [.getAllValidMoves()](#TTTRegularBoard+getAllValidMoves) ⇒ <code>Array.&lt;number&gt;</code>
    * [.makeMove(index)](#TTTRegularBoard+makeMove) ⇒ <code>boolean</code>
    * [.checkWin()](#TTTRegularBoard+checkWin)
    * [.clone()](#TTTRegularBoard+clone) ⇒ [<code>TTTRegularBoard</code>](#TTTRegularBoard)
    * [.getStateKey()](#TTTRegularBoard+getStateKey) ⇒ <code>string</code>
    * [.switchPlayer()](#TTTBase+switchPlayer)

<a name="TTTRegularBoard+grid"></a>

### tttRegularBoard.grid : <code>Array.&lt;number&gt;</code>
Das 3x3 Gitter als flaches Array (Indizes 0-8).
0 = Leer, 1 = Spieler 1, 2 = Spieler 2.

**Kind**: instance property of [<code>TTTRegularBoard</code>](#TTTRegularBoard)  
<a name="TTTBase+currentPlayer"></a>

### tttRegularBoard.currentPlayer : <code>number</code>
Aktueller Spieler. 
1 = Spieler 1 (Blau/Kreis), 2 = Spieler 2 (Rot/Kreuz).

**Kind**: instance property of [<code>TTTRegularBoard</code>](#TTTRegularBoard)  
**Overrides**: [<code>currentPlayer</code>](#TTTBase+currentPlayer)  
<a name="TTTBase+winner"></a>

### tttRegularBoard.winner : <code>number</code>
Gewinner des Spiels.
0 = Laufend, 1 = Spieler 1, 2 = Spieler 2, 3 = Remis.

**Kind**: instance property of [<code>TTTRegularBoard</code>](#TTTRegularBoard)  
**Overrides**: [<code>winner</code>](#TTTBase+winner)  
<a name="TTTRegularBoard+getAllValidMoves"></a>

### tttRegularBoard.getAllValidMoves() ⇒ <code>Array.&lt;number&gt;</code>
Liefert alle Indizes von leeren Feldern.
Liste der möglichen Züge.

**Kind**: instance method of [<code>TTTRegularBoard</code>](#TTTRegularBoard)  
<a name="TTTRegularBoard+makeMove"></a>

### tttRegularBoard.makeMove(index) ⇒ <code>boolean</code>
Führt einen Zug an der Position index aus.
- Index des Feldes (0-8).

**Kind**: instance method of [<code>TTTRegularBoard</code>](#TTTRegularBoard)  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | True, wenn der Zug gültig war. |

<a name="TTTRegularBoard+checkWin"></a>

### tttRegularBoard.checkWin()
Überprüft alle 8 Gewinnlinien auf 3 Gleiche.
Setzt this.winner entsprechend.

**Kind**: instance method of [<code>TTTRegularBoard</code>](#TTTRegularBoard)  
<a name="TTTRegularBoard+clone"></a>

### tttRegularBoard.clone() ⇒ [<code>TTTRegularBoard</code>](#TTTRegularBoard)
Erstellt eine tiefe Kopie des Boards (für KI-Simulationen).

**Kind**: instance method of [<code>TTTRegularBoard</code>](#TTTRegularBoard)  
<a name="TTTRegularBoard+getStateKey"></a>

### tttRegularBoard.getStateKey() ⇒ <code>string</code>
Generiert einen eindeutigen String für diesen Zustand.
 Hash Key.

**Kind**: instance method of [<code>TTTRegularBoard</code>](#TTTRegularBoard)  
<a name="TTTBase+switchPlayer"></a>

### tttRegularBoard.switchPlayer()
Wechselt den aktiven Spieler (1 -> 2 -> 1).

**Kind**: instance method of [<code>TTTRegularBoard</code>](#TTTRegularBoard)  
**Overrides**: [<code>switchPlayer</code>](#TTTBase+switchPlayer)  
<a name="TTT3DBoard"></a>

## TTT3DBoard ⇐ [<code>TTTBase</code>](#TTTBase)
3D Tic-Tac-Toe Board (Würfel).
Unterstützt variable Größen (z.B. 3x3x3 oder 4x4x4).

**Kind**: global class  
**Extends**: [<code>TTTBase</code>](#TTTBase)  

* [TTT3DBoard](#TTT3DBoard) ⇐ [<code>TTTBase</code>](#TTTBase)
    * [new TTT3DBoard([size])](#new_TTT3DBoard_new)
    * [.grid](#TTT3DBoard+grid) : <code>Array.&lt;number&gt;</code>
    * [.currentPlayer](#TTTBase+currentPlayer) : <code>number</code>
    * [.winner](#TTTBase+winner) : <code>number</code>
    * [.getAllValidMoves()](#TTT3DBoard+getAllValidMoves) ⇒ <code>Array.&lt;number&gt;</code>
    * [.makeMove(index)](#TTT3DBoard+makeMove) ⇒ <code>boolean</code>
    * [.checkWin()](#TTT3DBoard+checkWin)
    * [.switchPlayer()](#TTTBase+switchPlayer)

<a name="new_TTT3DBoard_new"></a>

### new TTT3DBoard([size])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [size] | <code>number</code> | <code>3</code> | Kantenlänge des Würfels. |

<a name="TTT3DBoard+grid"></a>

### ttT3DBoard.grid : <code>Array.&lt;number&gt;</code>
Das 3D Gitter als flaches Array.
Index = z * size^2 + y * size + x

**Kind**: instance property of [<code>TTT3DBoard</code>](#TTT3DBoard)  
<a name="TTTBase+currentPlayer"></a>

### ttT3DBoard.currentPlayer : <code>number</code>
Aktueller Spieler. 
1 = Spieler 1 (Blau/Kreis), 2 = Spieler 2 (Rot/Kreuz).

**Kind**: instance property of [<code>TTT3DBoard</code>](#TTT3DBoard)  
**Overrides**: [<code>currentPlayer</code>](#TTTBase+currentPlayer)  
<a name="TTTBase+winner"></a>

### ttT3DBoard.winner : <code>number</code>
Gewinner des Spiels.
0 = Laufend, 1 = Spieler 1, 2 = Spieler 2, 3 = Remis.

**Kind**: instance property of [<code>TTT3DBoard</code>](#TTT3DBoard)  
**Overrides**: [<code>winner</code>](#TTTBase+winner)  
<a name="TTT3DBoard+getAllValidMoves"></a>

### ttT3DBoard.getAllValidMoves() ⇒ <code>Array.&lt;number&gt;</code>
Liefert alle leeren Felder im Würfel.

**Kind**: instance method of [<code>TTT3DBoard</code>](#TTT3DBoard)  
<a name="TTT3DBoard+makeMove"></a>

### ttT3DBoard.makeMove(index) ⇒ <code>boolean</code>
Setzt einen Stein an index.
- Berechneter Index im flachen Array.

**Kind**: instance method of [<code>TTT3DBoard</code>](#TTT3DBoard)  

| Param | Type |
| --- | --- |
| index | <code>number</code> | 

<a name="TTT3DBoard+checkWin"></a>

### ttT3DBoard.checkWin()
Prüft alle möglichen Gewinnlinien im 3D Raum.
Es gibt 13 Richtungsvektoren (Achsen, Flächendiagonalen, Raumdiagonalen).

**Kind**: instance method of [<code>TTT3DBoard</code>](#TTT3DBoard)  
<a name="TTTBase+switchPlayer"></a>

### ttT3DBoard.switchPlayer()
Wechselt den aktiven Spieler (1 -> 2 -> 1).

**Kind**: instance method of [<code>TTT3DBoard</code>](#TTT3DBoard)  
**Overrides**: [<code>switchPlayer</code>](#TTTBase+switchPlayer)  
<a name="UltimateBoard"></a>

## UltimateBoard ⇐ [<code>TTTBase</code>](#TTTBase)
Ultimate Tic-Tac-Toe.
9 kleine Boards (3x3) in einem großen Board.

**Kind**: global class  
**Extends**: [<code>TTTBase</code>](#TTTBase)  

* [UltimateBoard](#UltimateBoard) ⇐ [<code>TTTBase</code>](#TTTBase)
    * [.boards](#UltimateBoard+boards) : <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
    * [.macroBoard](#UltimateBoard+macroBoard) : <code>Array.&lt;number&gt;</code>
    * [.nextBoardIdx](#UltimateBoard+nextBoardIdx) : <code>number</code>
    * [.currentPlayer](#TTTBase+currentPlayer) : <code>number</code>
    * [.winner](#TTTBase+winner) : <code>number</code>
    * [.getAllValidMoves()](#UltimateBoard+getAllValidMoves) ⇒ <code>Array.&lt;{big:number, small:number}&gt;</code>
    * [.makeMove(big, small)](#UltimateBoard+makeMove) ⇒ <code>boolean</code>
    * [._isBoardFullOrWon()](#UltimateBoard+_isBoardFullOrWon)
    * [._checkSmallWin()](#UltimateBoard+_checkSmallWin)
    * [.switchPlayer()](#TTTBase+switchPlayer)

<a name="UltimateBoard+boards"></a>

### ultimateBoard.boards : <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
9 Arrays à 9 Felder.

**Kind**: instance property of [<code>UltimateBoard</code>](#UltimateBoard)  
<a name="UltimateBoard+macroBoard"></a>

### ultimateBoard.macroBoard : <code>Array.&lt;number&gt;</code>
Status der 9 großen Felder (Makro-Board). 0=Offen, 1/2=Sieg, 3=Remis.

**Kind**: instance property of [<code>UltimateBoard</code>](#UltimateBoard)  
<a name="UltimateBoard+nextBoardIdx"></a>

### ultimateBoard.nextBoardIdx : <code>number</code>
Index des Boards, in das der nächste Spieler setzen MUSS. -1 = Freie Wahl.

**Kind**: instance property of [<code>UltimateBoard</code>](#UltimateBoard)  
<a name="TTTBase+currentPlayer"></a>

### ultimateBoard.currentPlayer : <code>number</code>
Aktueller Spieler. 
1 = Spieler 1 (Blau/Kreis), 2 = Spieler 2 (Rot/Kreuz).

**Kind**: instance property of [<code>UltimateBoard</code>](#UltimateBoard)  
**Overrides**: [<code>currentPlayer</code>](#TTTBase+currentPlayer)  
<a name="TTTBase+winner"></a>

### ultimateBoard.winner : <code>number</code>
Gewinner des Spiels.
0 = Laufend, 1 = Spieler 1, 2 = Spieler 2, 3 = Remis.

**Kind**: instance property of [<code>UltimateBoard</code>](#UltimateBoard)  
**Overrides**: [<code>winner</code>](#TTTBase+winner)  
<a name="UltimateBoard+getAllValidMoves"></a>

### ultimateBoard.getAllValidMoves() ⇒ <code>Array.&lt;{big:number, small:number}&gt;</code>
Liefert alle gültigen Züge als Objekte {big, small}.

**Kind**: instance method of [<code>UltimateBoard</code>](#UltimateBoard)  
<a name="UltimateBoard+makeMove"></a>

### ultimateBoard.makeMove(big, small) ⇒ <code>boolean</code>
Führt einen Zug aus.
- Index des großen Boards (0-8).

**Kind**: instance method of [<code>UltimateBoard</code>](#UltimateBoard)  

| Param | Type | Description |
| --- | --- | --- |
| big | <code>number</code> | - Index des kleinen Feldes (0-8). |
| small | <code>number</code> | True bei Erfolg. |

<a name="UltimateBoard+_isBoardFullOrWon"></a>

### ultimateBoard.\_isBoardFullOrWon()
Prüft, ob ein kleines Board nicht mehr bespielbar ist.

**Kind**: instance method of [<code>UltimateBoard</code>](#UltimateBoard)  
<a name="UltimateBoard+_checkSmallWin"></a>

### ultimateBoard.\_checkSmallWin()
Hilfsfunktion: 3-in-einer-Reihe auf einem 9er Array.

**Kind**: instance method of [<code>UltimateBoard</code>](#UltimateBoard)  
<a name="TTTBase+switchPlayer"></a>

### ultimateBoard.switchPlayer()
Wechselt den aktiven Spieler (1 -> 2 -> 1).

**Kind**: instance method of [<code>UltimateBoard</code>](#UltimateBoard)  
**Overrides**: [<code>switchPlayer</code>](#TTTBase+switchPlayer)  
<a name="Benchmark"></a>

## Benchmark
**Kind**: global class  

* [Benchmark](#Benchmark)
    * [new Benchmark()](#new_Benchmark_new)
    * [.history](#Benchmark+history) : <code>Array.&lt;{x: (number\|string), y: number}&gt;</code>
    * [.start()](#Benchmark+start)
    * [.stop()](#Benchmark+stop) ⇒ <code>number</code>
    * [.getDuration()](#Benchmark+getDuration) ⇒ <code>number</code>
    * [.record(label, [time])](#Benchmark+record)
    * [.getAverage()](#Benchmark+getAverage) ⇒ <code>number</code>
    * [.reset()](#Benchmark+reset)

<a name="new_Benchmark_new"></a>

### new Benchmark()
Utility-Klasse zur Messung von Laufzeiten.

<a name="Benchmark+history"></a>

### benchmark.history : <code>Array.&lt;{x: (number\|string), y: number}&gt;</code>
Gespeicherte Messdaten.

**Kind**: instance property of [<code>Benchmark</code>](#Benchmark)  
<a name="Benchmark+start"></a>

### benchmark.start()
Startet die Zeitmessung.

**Kind**: instance method of [<code>Benchmark</code>](#Benchmark)  
<a name="Benchmark+stop"></a>

### benchmark.stop() ⇒ <code>number</code>
Stoppt die Zeitmessung.

**Kind**: instance method of [<code>Benchmark</code>](#Benchmark)  
**Returns**: <code>number</code> - Dauer in ms.  
<a name="Benchmark+getDuration"></a>

### benchmark.getDuration() ⇒ <code>number</code>
**Kind**: instance method of [<code>Benchmark</code>](#Benchmark)  
**Returns**: <code>number</code> - Aktuelle Dauer in ms.  
<a name="Benchmark+record"></a>

### benchmark.record(label, [time])
Speichert einen Datenpunkt.

**Kind**: instance method of [<code>Benchmark</code>](#Benchmark)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| label | <code>number</code> \| <code>string</code> |  | Label für X-Achse. |
| [time] | <code>number</code> | <code></code> | Dauer (optional). |

<a name="Benchmark+getAverage"></a>

### benchmark.getAverage() ⇒ <code>number</code>
**Kind**: instance method of [<code>Benchmark</code>](#Benchmark)  
**Returns**: <code>number</code> - Durchschnitt aller Messungen.  
<a name="Benchmark+reset"></a>

### benchmark.reset()
Setzt alles zurück.

**Kind**: instance method of [<code>Benchmark</code>](#Benchmark)  
<a name="FlowchartVisualizer"></a>

## FlowchartVisualizer
**Kind**: global class  
<a name="new_FlowchartVisualizer_new"></a>

### new FlowchartVisualizer(containerId, tree, toggleCallback)

| Param | Type | Description |
| --- | --- | --- |
| containerId | <code>string</code> | DOM ID des Containers. |
| tree | [<code>DecisionTree</code>](#DecisionTree) | Der Regelbaum. |
| toggleCallback | <code>function</code> | Callback(ruleName). |

<a name="RuleVisualizer"></a>

## RuleVisualizer
**Kind**: global class  
<a name="new_RuleVisualizer_new"></a>

### new RuleVisualizer(containerId, tree, toggleCallback)

| Param | Type | Description |
| --- | --- | --- |
| containerId | <code>string</code> | ID des HTML Containers. |
| tree | [<code>DecisionTree</code>](#DecisionTree) | Der Baum. |
| toggleCallback | <code>function</code> | Wird gerufen, wenn Checkbox geklickt. |

<a name="TreeNode"></a>

## TreeNode
Repräsentiert einen einzelnen Knoten im Visualisierungsbaum.

**Kind**: global class  
<a name="new_TreeNode_new"></a>

### new TreeNode(id, data, depth, [parentMove])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>number</code> |  | Eindeutige ID. |
| data | <code>\*</code> |  | Das Datenobjekt (z.B. RotateBoard). |
| depth | <code>number</code> |  | Tiefe im Baum. |
| [parentMove] | <code>string</code> | <code>&quot;\&quot;\&quot;&quot;</code> | Die Aktion, die zu diesem Knoten führte. |

<a name="TreeVisualizer"></a>

## TreeVisualizer
Hauptklasse zur Visualisierung.

**Kind**: global class  

* [TreeVisualizer](#TreeVisualizer)
    * [new TreeVisualizer(canvasId)](#new_TreeVisualizer_new)
    * [.drawTree(root, options)](#TreeVisualizer+drawTree)

<a name="new_TreeVisualizer_new"></a>

### new TreeVisualizer(canvasId)

| Param | Type | Description |
| --- | --- | --- |
| canvasId | <code>string</code> | ID des HTML Canvas Elements. |

<a name="TreeVisualizer+drawTree"></a>

### treeVisualizer.drawTree(root, options)
Zeichnet den kompletten Baum.

**Kind**: instance method of [<code>TreeVisualizer</code>](#TreeVisualizer)  

| Param | Type | Description |
| --- | --- | --- |
| root | [<code>TreeNode</code>](#TreeNode) | Der Wurzelknoten. |
| options | <code>Object</code> | Konfigurationen (z.B. drawNodeFn). |

<a name="checkSmallWin"></a>

## checkSmallWin()
Hilfsfunktion für lokalen Sieg

**Kind**: global function  
<a name="createStrategyTree"></a>

## createStrategyTree()
Factory Methode: Erstellt den Baum basierend auf Spieltyp.
Hier nutzen wir jetzt ConditionNodes für echte Verzweigungen!

**Kind**: global function  
<a name="drawRotateBoard"></a>

## drawRotateBoard(board, canvas, ctx)
Zeichnet das Board auf den Canvas.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| board | [<code>RotateBoard</code>](#RotateBoard) | Das Spielbrett. |
| canvas | <code>HTMLCanvasElement</code> | Das Canvas-Element. |
| ctx | <code>CanvasRenderingContext2D</code> | Der Kontext. |

<a name="animateRelax"></a>

## animateRelax(board, canvas, ctx, speed, renderCallback) ⇒ <code>Promise.&lt;void&gt;</code>
Animiert das Fallen der Blöcke.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| board | [<code>RotateBoard</code>](#RotateBoard) |  |
| canvas | <code>HTMLCanvasElement</code> |  |
| ctx | <code>CanvasRenderingContext2D</code> |  |
| speed | <code>number</code> | Dummy parameter, Geschwindigkeit ist hardcoded. |
| renderCallback | <code>function</code> | Callback zum Neuzeichnen nach jedem Frame. |

<a name="solveBFS"></a>

## solveBFS() ⇒ <code>Promise.&lt;({path: Array.&lt;string&gt;, nodes: number}\|null)&gt;</code>
Findet den kürzesten Weg mittels Breitensuche (BFS).
Wrapper für SearchEngine, der asynchron läuft um das UI nicht zu blockieren.
* @param {RotateBoard} startBoard - Der Startzustand.

**Kind**: global function  
**Returns**: <code>Promise.&lt;({path: Array.&lt;string&gt;, nodes: number}\|null)&gt;</code> - Das Ergebnisobjekt oder null.  
<a name="SearchConfig"></a>

## SearchConfig : <code>Object</code>
Konfiguration für die Suchmaschine.

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [strategy] | <code>&#x27;BFS&#x27;</code> \| <code>&#x27;DFS&#x27;</code> | <code>&#x27;BFS&#x27;</code> | 'BFS' (Breitensuche) oder 'DFS' (Tiefensuche). |
| [maxDepth] | <code>number</code> | <code>1000</code> | Abbruch bei dieser Tiefe. |
| [checkDuplicates] | <code>boolean</code> | <code>true</code> | Verhindert Zyklen durch Hash-Set. |
| [sortSuccessors] | <code>function</code> | <code></code> | Heuristik zum Sortieren der Nachfolger (z.B. Warnsdorf). |
| [onStep] | <code>function</code> | <code></code> | Callback für jeden Schritt (Visualisierung). Rückgabe 'STOP' bricht ab. |

