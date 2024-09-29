
/**
 * AutoBind is a decorator that automatically binds the method it decorates
 * to the instance of the class in which it is defined. This is particularly
 * useful for methods that are passed as callbacks, ensuring that the correct
 * context (i.e., `this`) is maintained when the method is invoked.
 *
 * Usage:
 *
 * @AutoBind()
 * methodName() {
 *   // 'this' refers to the instance of the class
 * }
 *
 * How it works:
 * - The decorator returns a function that takes the target object, the name
 *   of the property (method), and the property descriptor as arguments.
 * - It stores the original method in a variable.
 * - It creates a new property descriptor that overrides the `get` method,
 *   which returns the original method bound to the current instance (`this`).
 * - This ensures that whenever the method is called, it retains the correct
 *   context, regardless of how it is invoked.
 */
export function AutoBind() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
      configurable: true,
      enumerable: false,
      get() {
        return originalMethod.bind(this);
      },
    };
    return adjDescriptor;
  };
}
