NOCTIA / Spine 4.3 import smoke test

In Spine: Import Data -> noctia-import-test.json. Keep the images folder beside the JSON. Choose the idle animation.

This is a program-authored single-image mesh with 5 bones and a 5-second idle animation. Hair edges use an approximate polygon. It is NOT the finished separated-layer rig; it has no blink or reconstructed hidden areas.

Spine Trial cannot save or export. This JSON is source data written by our own script, not an export or a .spine project. Verified in Spine Trial 4.3.23: Import Data succeeded; idle animation plays and the timeline advances. Import warns that mesh internal edge metadata is missing; the mesh and animation still load. Background remnants and approximate mesh edges remain visible. No Spine runtime is included.

