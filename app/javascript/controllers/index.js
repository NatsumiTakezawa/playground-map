// Stimulusコントローラ自動登録
import { Application } from "@hotwired/stimulus";
import { definitionsFromContext } from "@hotwired/stimulus-webpack-helpers";

window.Stimulus = Application.start();
const context = require.context("./", true, /_controller\.js$/);
window.Stimulus.load(definitionsFromContext(context));
