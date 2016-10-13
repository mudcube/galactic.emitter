# Galactic.emitter(...)

```js
var id = 'dosomething'
var handler = function () {}
var emitter = Galactic.emitter(scope)
emitter.on(id, handler) // register handler
emitter.on.handlers{} // contains all registered handlers
emitter.off(id) // unregister handler
emitter.emit(id, ...data) // emit handler
emitter.emit.andNotifyNewHandlers(id, ...data) // emit handler now and immediately ever after
```

### emitter.andNotifyNewHandlers(...)

```js
emitter.on('dosomething', handler)
emitter.emit.andNotifyNewHandlers('dosomething', ...data) // the on(...) handler above is emitted now
emitter.on('dosomething', handler) // anything called from now on is emitted immediately
```