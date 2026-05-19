const supabaseUrl = "https://jaizsjcrwpeuxrlhtkfr.supabase.co";

const supabaseKey = "sb_publishable_wbusVwM2HQx8pIi5k2y-Ug_0vDVMY2a";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const applicationForm = document.querySelector("#applicationForm");
const successMessage = document.querySelector("#successMessage");

const phoneInput = document.querySelector("#phone");
const ageInput = document.querySelector("#age");
const teamsError = document.querySelector("#teamsError");

if (phoneInput) {
  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 8);
  });
}

if (ageInput) {
  ageInput.addEventListener("input", () => {
    ageInput.value = ageInput.value.replace(/\D/g, "").slice(0, 3);
  });
}

applicationForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData(applicationForm);

  const selectedTeams = formData.getAll("teams");

  if (selectedTeams.length === 0) {
    if (teamsError) {
      teamsError.textContent = "Vælg mindst ét hold.";
      teamsError.classList.add("show");
    } else {
      alert("Vælg mindst ét hold.");
    }

    return;
  }

  if (teamsError) {
    teamsError.textContent = "";
    teamsError.classList.remove("show");
  }

  const name = formData.get("name").trim();
  const age = formData.get("age").trim();
  const email = formData.get("email").trim();
  const phone = formData.get("phone").trim();
  const experience = formData.get("experience").trim();
  const ideas = formData.get("ideas").trim();

  if (!name || !age || !email || !phone || !experience) {
    alert("Udfyld venligst alle påkrævede felter.");
    return;
  }

  if (!/^\d+$/.test(age)) {
    alert("Alder må kun indeholde tal.");
    return;
  }

  if (!/^\d{8}$/.test(phone)) {
    alert("Telefonnummer skal være 8 cifre.");
    return;
  }

  const applicant = {
    name: name,
    age: Number(age),
    email: email,
    phone: phone,
    teams: selectedTeams,
    experience: experience,
    ideas: ideas || null,
  };

  console.log("Sender til Supabase:", applicant);

  const submitButton = applicationForm.querySelector(".submit-btn");
  const originalButtonText = submitButton.textContent;

  submitButton.disabled = true;
  submitButton.textContent = "Sender...";

  const { error } = await supabaseClient.from("applications").insert([applicant]);

  submitButton.disabled = false;
  submitButton.textContent = originalButtonText;

  if (error) {
    console.error("Supabase fejl:", error);
    alert("Noget gik galt. Prøv igen.");
    return;
  }

  successMessage.classList.add("show");
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
