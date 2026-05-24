# Backend Module Domain Layout

Each module follows:

```text
src/modules/{module}/
  controller/
  service/
  repository/
  routes/
  validator/
  dto/
  types/
  events/
  tests/
```

This scaffold enables independent domain ownership and gradual migration from legacy layers.
