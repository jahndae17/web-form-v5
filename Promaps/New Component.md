## Rules
* Reactive not proactive commands
* Avoid creating new functions until they are needed
* document.elementFromPoint(x, y) can find which item the user is trying to select

### Create element
```
const div = document.createElement('div'); // New element
const existing = document.getElementById('myDiv'); // Existing
```