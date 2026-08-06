<%*
/*
  Templater template for a new quick thought.

  Set it as a folder template for Writing/Brain Dump:
    Settings -> Templater -> Folder Templates -> add
      Folder:   Writing/Brain Dump
      Template: Templates/quick thought

  New notes then start as drafts. The sync skips anything with draft: true, so
  a piece you are still writing never publishes itself mid-sentence. When it is
  ready, untick "draft" in the Properties panel (or delete the line) and it goes
  live on the next sync.
*/
-%>
---
created: <% tp.date.now("YYYY-MM-DD") %>
draft: true
---

