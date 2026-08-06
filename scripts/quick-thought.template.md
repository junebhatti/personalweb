<%*
/*
  Templater template for a new quick thought.

  Copy this file into the vault's Templates folder, then point Templater at it
  (Settings → Templater → Folder Templates) for Writing/Brain Dump so every new
  note in there starts with the right frontmatter.

  publish starts false on purpose: a note is drafted first and published
  deliberately, never by accident.
*/
-%>
---
created: <% tp.date.now("YYYY-MM-DD") %>
publish: false
---

