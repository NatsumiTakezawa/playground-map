# PWA用コントローラ
# manifest.json, service-worker.jsを配信
class PwaController < ApplicationController
  # @return [void]
  def manifest
    respond_to do |format|
      format.json { render "pwa/manifest.json" }
    end
  end

  def service_worker
    respond_to do |format|
      format.js { render "pwa/service-worker.js" }
    end
  end
end
