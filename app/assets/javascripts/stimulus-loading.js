// Importmap/ESM用 stimulus-loading.js
// context: import.meta.globで生成されたオブジェクトを想定
export function eagerLoadControllersFrom(context, application) {
  Object.entries(context).forEach(([key, value]) => {
    // 例: "./foo_controller.js" → "foo"
    const identifier = key
      .replace(/^\.\/(.*)_controller\.js$/, "$1")
      .replace(/\//g, "--");
    value().then((module) => {
      application.register(identifier, module.default);
    });
  });
}
