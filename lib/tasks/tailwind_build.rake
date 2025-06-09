# lib/tasks/tailwind_build.rake

namespace :tailwindcss do
  desc "Build Tailwind CSS once"
  task :build do
    sh <<~CMD
      tailwindcss \
        -i app/assets/tailwind/application.css \
        -o app/assets/builds/tailwind.css \
        --config tailwind.config.js \
        --minify
    CMD
  end

  desc "Watch Tailwind CSS in polling mode (no Watchman needed)"
  task :watch do
    sh <<~CMD
      tailwindcss \
        -i app/assets/tailwind/application.css \
        -o app/assets/builds/tailwind.css \
        --config tailwind.config.js \
        --watch \
        --poll
    CMD
  end
end
