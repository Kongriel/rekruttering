const supabaseUrl = "https://jaizsjcrwpeuxrlhtkfr.supabase.co";

const supabaseKey = "sb_publishable_wbusVwM2HQx8pIi5k2y-Ug_0vDVMY2a";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const applicationForm = document.querySelector("#applicationForm");
const successMessage = document.querySelector("#successMessage");

applicationForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Hent alle data fra formen
  const formData = new FormData(applicationForm);

  const applicant = {
    name: formData.get("name"),
    age: Number(formData.get("age")),
    email: formData.get("email"),
    phone: formData.get("phone"),

    // Flere valgte hold
    teams: formData.getAll("teams"),

    experience: formData.get("experience"),

    ideas: formData.get("ideas"),
  };

  console.log("Sender til Supabase:", applicant);

  // Send til Supabase
  const { error } = await supabaseClient.from("applications").insert([applicant]);

  // Error handling
  if (error) {
    console.error("Supabase fejl:", error);

    alert("Noget gik galt. Prøv igen.");

    return;
  }

  // Success
  successMessage.classList.add("show");

  // Reset form
  applicationForm.reset();

  console.log("Ansøgning sendt!");
});

document.addEventListener("DOMContentLoaded", () => {
  const reelVideo = document.querySelector(".reel-video");
  const playOverlay = document.querySelector(".video-play");

  if (!reelVideo || !playOverlay) return;

  reelVideo.volume = 0.5;

  reelVideo.addEventListener("play", () => {
    playOverlay.classList.add("is-hidden");
  });

  reelVideo.addEventListener("pause", () => {
    playOverlay.classList.remove("is-hidden");
  });

  reelVideo.addEventListener("ended", () => {
    playOverlay.classList.remove("is-hidden");
  });
});

