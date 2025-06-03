<script>
  let { categoriesStatus } = $props();

  let isMinimized = $state(false);
  let isMinimizing = $state(false);

  let widgetEl = $state();
  let startX, startY, startLeft, startTop;
  let isDragging = $state(false);

  let left = $state(32);
  let bottom = $state(32);

  // Snap to bottom-left on window resize
  if (typeof window !== "undefined") {
    window.addEventListener('resize', () => {
      left = 32;
      bottom = 32;
    });
  }

  function onMinimize() {
    // Instantly move to the corner (no animation)
    left = 32;
    bottom = 32;
    // Wait for next microtask so CSS applies new position before animating scale/opacity
    setTimeout(() => {
      isMinimizing = true;
      setTimeout(() => {
        isMinimizing = false;
        isMinimized = true;
      }, 180); // Match the CSS duration below
    }, 10);
  }
  function onRestore() {
    isMinimized = false;
    // isMinimizing stays false on restore so scale/opacity animate back in
  }

  function onDragStart(e) {
    isDragging = true;
    widgetEl.style.transition = "none";
    if (e.type === "touchstart") {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else {
      startX = e.clientX;
      startY = e.clientY;
    }
    startLeft = left;
    startTop = window.innerHeight - widgetEl.getBoundingClientRect().bottom;
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
  }
  function onDragMove(e) {
    if (!isDragging) return;
    let x, y;
    if (e.type === "touchmove") {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    left = Math.max(0, startLeft + (x - startX));
    bottom = Math.max(0, startTop - (y - startY));
    left = Math.min(left, window.innerWidth - 260);
    bottom = Math.min(bottom, window.innerHeight - 90);
    e.preventDefault?.();
  }
  function onDragEnd() {
    isDragging = false;
    widgetEl.style.transition = "";
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
  }
</script>

{#if isMinimized}
  <div class="categories-status-fab"
    style="left:{left}px; bottom:{bottom}px;"
    onclick={onRestore}
    title="הצג סטטוס קטגוריות">
    <span>🧮</span>
  </div>
{:else}
  <div bind:this={widgetEl}
    class="categories-status-summary-widget {isMinimizing ? 'minimizing' : ''}"
    style="left:{left}px; bottom:{bottom}px;"
    onmousedown={onDragStart}
    ontouchstart={onDragStart}
    >
    <div class="widget-header">
      <span>סטטוס בחירת קטגוריות</span>
      <button class="widget-min-btn" onclick={onMinimize} title="מזער">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="#4a90e2" stroke-width="1.6" fill="#e7f4fd"/>
          <path d="M7 9.5l3 3 3-3" stroke="#4a90e2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <ul>
      {#each Object.values(categoriesStatus.perCategory) as cat}
        <li class="category-status {cat.isFull ? 'full' : 'not-full'}">
          <span class="cat-name">{cat.category}:</span>
          <span class="cat-status-text">{cat.status}</span>
        </li>
      {/each}
    </ul>
    <div class="all-cats-status {categoriesStatus.allCategoriesFull ? 'all-full' : 'not-all-full'}">
      {#if categoriesStatus.allCategoriesFull}
        ✔️ כל הקטגוריות מלאות! אפשר להמשיך
      {:else}
        ⚠️ נותרו קטגוריות שלא הושלמו
      {/if}
    </div>
  </div>
{/if}

<style>
.categories-status-summary-widget,
.categories-status-fab {
  position: fixed;
  z-index: 9999;
  direction: rtl;
  user-select: none;
  cursor: grab;
}
.categories-status-summary-widget {
  min-width: 170px;
  max-width: 420px;
  width: max-content;
  background: #f8fcff;
  border: 1.5px solid #95c8f6;
  border-radius: 18px;
  box-shadow: 0 2px 14px #b8e1fd3f;
  padding: 18px 16px 14px 16px;
  font-family: inherit;
  font-size: 1em;
  word-break: keep-all;
  white-space: nowrap;
  transition:
    opacity 0.18s cubic-bezier(.62,-0.09,.42,1.03),
    transform 0.18s cubic-bezier(.62,-0.09,.42,1.03);
  opacity: 1;
  transform: scale(1);
}
.categories-status-summary-widget.minimizing {
  opacity: 0;
  transform: scale(0.7);
  pointer-events: none;
}
.widget-header {
  font-weight: 600;
  font-size: 1.09em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
  color: #1378b8;
  cursor: move;
  white-space: nowrap;
  gap: 4px;
}
.widget-min-btn {
  border: none;
  background: #e8f1fb;
  color: #4a90e2;
  font-size: 1.2em;
  padding: 3px 8px 2px 8px;
  cursor: pointer;
  border-radius: 7px;
  margin-right: 5px;
  display: flex;
  align-items: center;
  transition: background 0.13s;
  height: 28px;
}
.widget-min-btn:hover {
  background: #d7e7f6;
  color: #183e5d;
}
.categories-status-summary-widget ul {
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
  font-size: 0.98em;
}
.category-status {
  padding: 5px 0;
  display: flex;
  align-items: center;
  white-space: nowrap;
  gap: 7px;
  border-radius: 6px;
  transition: background 0.18s;
}
.category-status.full .cat-status-text {
  color: #18a120;
  font-weight: 600;
}
.category-status.not-full .cat-status-text {
  color: #e66923;
  font-weight: 500;
}
.cat-name {
  font-weight: 600;
  display: inline-block;
  margin-left: 2px;
  white-space: nowrap;
}
.category-status .cat-status-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 170px;
  display: inline-block;
}
.all-cats-status {
  margin-top: 14px;
  padding: 8px 0 0 0;
  border-top: 1px solid #e4eaf2;
  font-size: 1.06em;
  text-align: center;
  font-weight: bold;
  white-space: nowrap;
}
.all-cats-status.all-full {
  color: #19a133;
}
.all-cats-status.not-all-full {
  color: #c53232;
}
.categories-status-fab {
  width: 54px;
  height: 54px;
  background: linear-gradient(130deg, #e5f6fd 60%, #aee2ff 100%);
  color: #1875b7;
  border-radius: 50%;
  border: 2.5px solid #95c8f6;
  box-shadow: 0 1px 6px #b0e3ff50;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.1em;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
  right: unset;
  opacity: 0;
  animation: fadeInFab 0.18s 0.15s both;
}
@keyframes fadeInFab {
  to { opacity: 1; }
}
.categories-status-fab:hover {
  background: #daf1ff;
  box-shadow: 0 3px 13px #9ed4ff67;
}
</style>
