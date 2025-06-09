// Minimal stimulus-loading.js (from official repo)
export function eagerLoadControllersFrom(context, application) {
  if (typeof context === "string") {
    context = require.context(context, true, /_controller\.js$/);
  }
  context.keys().forEach((filename) => {
    const identifier = filename
      .replace(/^.\//, "")
      .replace(/_controller\.js$/, "")
      .replace(/\//g, "--");
    application.register(identifier, context(filename).default);
  });
}
