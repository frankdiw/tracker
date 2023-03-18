import { Idle } from "./idle";
import { Track } from "./track";

const instance = new Idle();

new Track({
  reportLog: (log) => {
    console.log(log)
  }
});

