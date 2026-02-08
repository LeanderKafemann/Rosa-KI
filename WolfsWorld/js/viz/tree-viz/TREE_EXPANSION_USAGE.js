/**
 * Tree-Folding Feature Flag - Usage Examples
 * 
 * TreeVizEngine now supports optional interactive tree node expansion/collapse
 * control via the enableTreeExpansion feature flag.
 */

// ============================================================================
// EXAMPLE 1: Minimax Visualizer (WITH Tree-Folding enabled)
// ============================================================================

const minimaxCanvas = document.getElementById('minimax-canvas');
const minimaxViz = new TreeVizEngine(minimaxCanvas, {
    enableTreeExpansion: true,    // ← ENABLE for Minimax
    enableActiveNodeTracking: true,
    autoFitZoom: false,
    showOverlay: true,
    nodeRadius: 40,
    levelHeight: 120
});

// Users can now:
// - Click the GREEN "+" symbol to expand collapsed nodes
// - Click the RED "-" symbol to collapse expanded nodes
// - See children only when expanded (reduces visual clutter)


// ============================================================================
// EXAMPLE 2: RotateBox Visualizer (WITHOUT Tree-Folding)
// ============================================================================

const rotateboxCanvas = document.getElementById('rotatebox-canvas');
const rotateboxViz = new TreeVizEngine(rotateboxCanvas, {
    enableTreeExpansion: false,   // ← DISABLE for RotateBox (best for small trees)
    enableActiveNodeTracking: true,
    autoFitZoom: true,
    showOverlay: true,
    nodeRadius: 35,
    levelHeight: 100
});

// Users see:
// - All nodes and edges rendered automatically
// - No expand/collapse UI elements (cleaner interface)
// - Better for small to medium-sized search trees


// ============================================================================
// EXAMPLE 3: Knights-Tour Visualizer (WITHOUT Tree-Folding)
// ============================================================================

const knightCanvas = document.getElementById('knight-canvas');
const knightViz = new TreeVizEngine(knightCanvas, {
    enableTreeExpansion: false,   // ← DISABLE for Knights-Tour
    enableActiveNodeTracking: false,
    nodeRadius: 30,
    levelHeight: 100
});

// Optimized for visualization-only mode


// ============================================================================
// KEY DIFFERENCES
// ============================================================================

// WITH enableTreeExpansion: true
// ────────────────────────────────
// ✓ Interactive +/- indicators on expandable nodes
// ✓ Collapsed nodes hide their children (reduces visual noise)
// ✓ Users explore the tree step-by-step
// ✓ Good for: Minimax, Alpha-Beta, complex decision trees
// ✗ Minimal overhead when navigating tree

// WITHOUT enableTreeExpansion: false (default)
// ──────────────────────────────────────────
// ✓ All nodes visible immediately
// ✓ No expand/collapse UI clutter
// ✓ Better for: RotateBox, Knights-Tour, BFS/DFS visualizations
// ✓ Lean interface, no interactive tree navigation
// · Only ~1-2% CPU overhead per frame (5 boolean checks)


// ============================================================================
// TECHNICAL DETAILS
// ============================================================================

// How it works internally:
// 
// 1. Config Flag: enableTreeExpansion (default: false)
//    - Set in TreeVizEngine constructor options
//    - Can't be changed after construction
//
// 2. User Interaction:
//    - if enableTreeExpansion === true:
//      + Click on +/- symbol: expand/collapse node
//      + Node visibility filtered in render()
//    - if enableTreeExpansion === false:
//      + Clicks on nodes trigger normal postMessage (no expansion)
//      + All nodes rendered (no filtering)
//
// 3. Performance Impact (when disabled):
//    - 1 boolean check in handleNodeClick()
//    - 1 boolean check in expandNode()
//    - 1 boolean check in foldNode()
//    - 1 boolean check in render() before visibility filtering
//    - Total: ~1-2% CPU per frame
//
// 4. Code Path:
//    - If enabled: `handleNodeClick() → if hitExpansion → expandNode()/foldNode()`
//    - If disabled: `handleNodeClick() → postMessage (normal flow)`


// ============================================================================
// MIGRATION GUIDE
// ============================================================================

// If you have existing code using TreeVizEngine:
//
// BEFORE (existing code still works):
// ──────
// const viz = new TreeVizEngine(canvas);  // enableTreeExpansion defaults to false
//
// AFTER (explicitly set as needed):
// ─────
// const viz = new TreeVizEngine(canvas, { 
//     enableTreeExpansion: false   // Explicit (or leave unset for default)
// });
//
// FOR MINIMAX:
// ──────
// const viz = new TreeVizEngine(canvas, { 
//     enableTreeExpansion: true    // Enable interactive tree folding
// });


// ============================================================================
// RECOMMENDED SETTINGS
// ============================================================================

// Minimax Visualizer
const minimaxConfig = {
    enableTreeExpansion: true,           // Users should explore tree step-by-step
    enableActiveNodeTracking: true,      // Follow active node during evaluation
    autoFitZoom: false,                  // Preserve viewport when expanding
    showOverlay: true,
    nodeRadius: 40,
    levelHeight: 120,
    horizontalSpacing: 100
};

// RotateBox Visualizer
const rotateboxConfig = {
    enableTreeExpansion: false,          // Show full tree immediately
    enableActiveNodeTracking: true,      // Show current search state
    autoFitZoom: true,                   // Auto-fit to tree size
    showOverlay: true,
    nodeRadius: 35,
    levelHeight: 100,
    horizontalSpacing: 80
};

// Knights-Tour Visualizer
const knightConfig = {
    enableTreeExpansion: false,          // Show full tree for path analysis
    enableActiveNodeTracking: false,     // Visualization-only mode
    autoFitZoom: true,
    showOverlay: false,
    nodeRadius: 30,
    levelHeight: 100,
    horizontalSpacing: 80
};

// BFS/DFS Visualizer
const searchConfig = {
    enableTreeExpansion: false,          // Show all search states
    enableActiveNodeTracking: true,      // Highlight current node
    autoFitZoom: true,
    showOverlay: true,
    nodeRadius: 35,
    levelHeight: 110
};
