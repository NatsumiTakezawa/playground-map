import { application } from "controllers/application";
import RatingStarsController from "controllers/rating_stars_controller";
import SpotCardController from "controllers/spot_card_controller";
import MapController from "controllers/map_controller";
import ModalController from "controllers/modal_controller";
import FileInputController from "controllers/file_input_controller";
import ZipcodeController from "controllers/zipcode_controller";

application.register("rating-stars", RatingStarsController);
application.register("spot-card", SpotCardController);
application.register("map", MapController);
application.register("modal", ModalController);
application.register("file-input", FileInputController);
application.register("zipcode", ZipcodeController);
