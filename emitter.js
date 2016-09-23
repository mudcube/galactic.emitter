function EventEmitter(target) {
	target || (target = {})
	if (target.on || target.off || target.emit) {
		return target // already has handlers
	}

	var alwaysNotify = {}
	var handlers = {}
	var uniqueId = 1

	function createId(type, handler) {
		if (typeof handler !== 'function') {
			console.error(`${type} listener is undefined`)
			return
		}

		var handlerId = handler.uniqueId || (handler.uniqueId = uniqueId++)
		return `${type}.${handlerId}`
	}

	function listener(type) {
		if (handlers[type]) {
			return handlers[type]
		} else {
			return handlers[type] = Stack(type)
		}
	}

	function Stack(type) {
		var stack = {}

		function emitter() {
			var overrides = false
			for (var key in stack) {
				if (stack[key].apply(target, arguments)) {
					overrides = true
				}
			}
			return overrides
		}

		emitter.add = function (handler, that) {
			var fid = createId(type, handler)
			if (stack[fid] === undefined && handler) {
				stack[fid] = handler
			}
			return {
				add() {
					stack[fid] = handler
				},
				remove() {
					delete stack[fid]
				}
			}
		}

		emitter.remove = function (handler) {
			var fid = createId(type, handler)
			if (stack[fid] !== undefined && handler) {
				delete stack[fid]
			}
		}

		return emitter
	}

	target.on = function (type, handler) {
		if (alwaysNotify[type]) {
			handler(...alwaysNotify[type])
		}

		var emitter = listener(type).add(handler)
		var out = toEmitter(this)
		out.add = emitter.add //- depreciate
		out.remove = emitter.remove //- depreciate
		out.on = this.on
		out.off = this.off
		out.emit = this.emit
		return out
	}

	target.on.once = function (type, handler) {
		var emitter
		return emitter = target.on(type, function () {
			handler(...arguments)
			emitter.remove()
		})
	}

	target.on.handlers = handlers

	target.off = function (type, handler) {
		if (handler) {
			listener(type).remove(handler)
		} else {
			delete handlers[type]
		}
	}

	target.emit = function (type) {
		var stack = handlers[type]
		if (stack) {
			var args = Array.prototype.slice.call(arguments).slice(1)
			return stack.apply(target, args)
		}
	}

	target.emit.andNotifyNewHandlers = function (type) {
		alwaysNotify[type] = arguments
		target.emit(...arguments)
	}

	target.emit.promiseRequest = function (type) { //- depreciate
		return new Promise((resolve, reject) => {
			target.emit(type, resolve, reject)
		})
	}
	return target
}

function toEmitter(object) {
	if (!object.then) {
		return {}
	}

	if (object.on && object.off && object.emit) {
		return object
	}
	return EventEmitter(object)
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = EventEmitter
} else {
	self.Galactic || (self.Galactic = {})
	Galactic.emitter = EventEmitter
}