let aboutMeData;
let projectsData;

const aboutMeContainer = document.getElementById("aboutMe");

const init = async () => {
  const [aboutMeResponse, projectsResponse] = await Promise.all([
    getAboutMeData(),
    getProjectsData(),
  ]);

  aboutMeData = aboutMeResponse;
  projectsData = projectsResponse;

  createAboutMeSection(aboutMeData);
  await createProjectsCardsSection(projectsData); // await to ensure image validation

  addListeners();

  setArrowsFunctionality(getScrollingDirection());
};

const addListeners = () => {
  const form = document.getElementById("formSection");
  const charactersLeft = document.getElementById("charactersLeft");
  const contactMessage = document.getElementById("contactMessage");

  contactMessage.addEventListener("input", () => {
    const length = contactMessage.value.length;
    charactersLeft.innerText = ` ${length}/300`;
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Form submitted without refresh");
    onFormSubmitValidation();
  });
  window.addEventListener("resize", onWindowResized);
};

const getAboutMeData = () => {
  return fetch("starter/data/aboutMeData.json")
    .then((response) => response.json())
    .catch((error) => console.log("Error fetching About Me:", error));
};

const getProjectsData = () => {
  return fetch("starter/data/projectsData.json")
    .then((response) => response.json())
    .catch((error) => console.log("Error fetching Projects:", error));
};

const createAboutMeSection = (data) => {
  const aboutMeBlurb = document.createElement("p");
  aboutMeBlurb.innerText = data.aboutMe;

  const headShotImageContainer = document.createElement("div");
  headShotImageContainer.className = "headshotContainer";

  const headShotImg = document.createElement("img");
  headShotImg.setAttribute("src", `starter/data/${data.headshot}`);
  headShotImg.setAttribute("alt", "Portrait photo");

  headShotImageContainer.appendChild(headShotImg);

  aboutMeContainer.append(aboutMeBlurb, headShotImageContainer);
};

const createProjectsCardsSection = async (projectsData) => {
  const projectsContainer = document.getElementById("projectList");

  const validations = await Promise.all(
    projectsData.map((project) =>
      validateImage(`starter/data/${project.card_image}`)
    )
  );

  viewProjectCard(projectsData[0]);

  projectsData.forEach((project, index) => {
    const { valid } = validations[index];

    const projectCard = document.createElement("div");
    const projectName = document.createElement("h4");
    const projectDesc = document.createElement("p");

    projectCard.className = "projectCard";
    projectCard.id = project.project_id;

    const imageUrl = valid
      ? `starter/data/${project.card_image}`
      : `starter/data/../images/card_placeholder_bg.webp`;

    projectCard.style.backgroundImage = `url(${imageUrl})`;

    projectCard.addEventListener("click", () => {
      viewProjectCard(project);
    });

    projectName.innerText = project.project_name;
    projectDesc.innerText = project.short_description;

    projectCard.append(projectName, projectDesc);
    projectsContainer.appendChild(projectCard);
  });
};

const validateImage = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ url: imageUrl, valid: true });
    img.onerror = () => resolve({ url: imageUrl, valid: false });
    img.src = imageUrl;
  });
};

const viewProjectCard = async (projectCardData) => {
  const projectSpotlight = document.getElementById("projectSpotlight");

  const imagePath = `starter/data/${projectCardData.spotlight_image}`;
  const fallbackPath = `starter/data/../images/spotlight_placeholder_bg.webp`;

  const { valid } = await validateImage(imagePath);
  const imageUrl = valid ? imagePath : fallbackPath;

  projectSpotlight.style.backgroundImage = `url(${imageUrl})`;

  const spotlightTitles = document.getElementById("spotlightTitles");
  spotlightTitles.innerHTML = `
    <h3>${projectCardData.project_name}</h3>
    <p>${projectCardData.long_description}</p>
  `;
};

const getScrollingDirection = () => {
  const projectList = document.getElementById("projectList");
  const style = window.getComputedStyle(projectList);
  return style.flexDirection; // "row" or "column"
};

const onWindowResized = () => {
  const scrollDirection = getScrollingDirection();
  setArrowsFunctionality(scrollDirection);
};

const clearArrowListeners = () => {
  const arrowLeft = document.querySelector(".arrow-left");
  const arrowRight = document.querySelector(".arrow-right");

  const newArrowLeft = arrowLeft.cloneNode(true);
  const newArrowRight = arrowRight.cloneNode(true);

  arrowLeft.replaceWith(newArrowLeft);
  arrowRight.replaceWith(newArrowRight);
};

const setArrowsFunctionality = (scrollDirection) => {
  clearArrowListeners();

  const projectList = document.getElementById("projectList");
  const arrowLeft = document.querySelector(".arrow-left");
  const arrowRight = document.querySelector(".arrow-right");

  if (scrollDirection === "column") {
    arrowRight.addEventListener("click", () => {
      projectList.scrollBy({ top: 250, behavior: "smooth" });
    });

    arrowLeft.addEventListener("click", () => {
      projectList.scrollBy({ top: -250, behavior: "smooth" });
    });
  } else {
    arrowRight.addEventListener("click", () => {
      projectList.scrollBy({ left: 250, behavior: "smooth" });
    });

    arrowLeft.addEventListener("click", () => {
      projectList.scrollBy({ left: -250, behavior: "smooth" });
    });
  }
};

const onFormSubmitValidation = () => {
  const MESSAGE_LENGTH = 300;

  let messageError = document.getElementById("messageError");
  let emailError = document.getElementById("emailError");
  const contactEmail = document.getElementById("contactEmail");
  const contactMessage = document.getElementById("contactMessage");

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const illegalCharacters = /[^a-zA-Z0-9@._-]/;

  messageError.innerHTML = ``;
  emailError.innerHTML = ``;

  const emailValue = contactEmail.value.trim();
  const messageValue = contactMessage.value.trim();

  const emptyEmail = emailValue === "";
  const emptyMessage = messageValue === "";
  const validEmailAddress = validEmail.test(emailValue);
  const illegalMessage = illegalCharacters.test(messageValue);

  const invalidEmailFormat = !validEmailAddress && !emptyEmail;
  const illegalMessageChar = illegalMessage && !emptyMessage;
  const messageTooLong = messageValue.length > MESSAGE_LENGTH;

  if (emptyEmail) {
    emailError.innerHTML += `Email should not be empty!<br>`;
  }

  if (invalidEmailFormat) {
    emailError.innerHTML += `Email must be a valid email address!<br>`;
  }

  if (emptyMessage) {
    messageError.innerHTML += `Message should not be empty!<br>`;
  }

  if (illegalMessageChar) {
    messageError.innerHTML += `Message must not have illegal characters!<br>`;
  }

  if (messageTooLong) {
    messageError.innerHTML += `Message must not be longer than ${MESSAGE_LENGTH} characters!<br>`;
  }

  if (!invalidEmailFormat && !illegalMessageChar && !messageTooLong) {
    alert("Form passed validation! 🎉");
  }
};

init();
