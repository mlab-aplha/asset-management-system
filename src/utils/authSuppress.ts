let _count = 0;

export const authSuppress = {
    increment() { _count += 1; },
    decrement() { _count = Math.max(0, _count - 1); },
    isActive() { return _count > 0; },
};
