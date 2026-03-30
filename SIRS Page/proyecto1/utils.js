/**
 * Attaches live search/filter to a <select> element.
 * Rebuilds the select options from a full list so it works cross-browser.
 *
 * @param {HTMLInputElement}   searchEl   - text input used for filtering
 * @param {HTMLSelectElement}  selectEl   - the select to filter
 * @param {Array<{value, label}>} allOpts - complete options list
 * @param {string} [emptyLabel]           - optional blank first option text
 */
function attachSelectSearch(searchEl, selectEl, allOpts, emptyLabel) {
  function rebuild(q) {
    const query   = q.toLowerCase().trim();
    const prev    = selectEl.value;
    const matches = query ? allOpts.filter(o => o.label.toLowerCase().includes(query)) : allOpts;

    selectEl.innerHTML = "";
    if (emptyLabel) {
      const blank = new Option(emptyLabel, "");
      selectEl.appendChild(blank);
    }
    matches.forEach(o => selectEl.appendChild(new Option(o.label, o.value)));

    if (matches.some(o => String(o.value) === String(prev))) selectEl.value = prev;
  }

  searchEl.addEventListener("input",   () => rebuild(searchEl.value));
  searchEl.addEventListener("keydown", e  => { if (e.key === "Escape") { searchEl.value = ""; rebuild(""); } });
}

/**
 * Attaches live row-filter to a table <tbody>.
 * After re-rendering tbody content call  searchEl.dispatchEvent(new Event("input"))
 * to restore the filter state.
 *
 * @param {HTMLInputElement}       searchEl
 * @param {HTMLTableSectionElement} tbodyEl
 */
function attachTableFilter(searchEl, tbodyEl) {
  if (!searchEl || !tbodyEl) return;
  searchEl.addEventListener("input", () => {
    const q = searchEl.value.toLowerCase().trim();
    Array.from(tbodyEl.rows).forEach(row => {
      row.style.display = !q || row.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });
  searchEl.addEventListener("keydown", e => {
    if (e.key === "Escape") { searchEl.value = ""; searchEl.dispatchEvent(new Event("input")); }
  });
}
