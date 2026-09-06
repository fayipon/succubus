export function characterAnimations(names: string[]) {
  return {
    idle: names.find(name=>/^idle$/i.test(name)) ?? names.find(name=>/idle/i.test(name)),
    motion: names.find(name=>/^motion$/i.test(name)) ?? names.find(name=>/motion/i.test(name)),
  };
}
