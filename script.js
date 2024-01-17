const perPage = 10;
let currentPage = 1;
let totalRepositories = 0;



function showRepoSearchBar(user) {
  const userImage = document.getElementById("user-image");
  userImage.src = user.avatar_url;

  const userName = document.getElementById("user-name");
  userName.textContent = user.name || user.login;

  const githubLink = document.getElementById("github-link");
  githubLink.innerHTML = `<a href="${user.html_url}" target="_blank">${user.html_url}</a>`;

  $("#user-info").show();
  $("#search-bar").hide();
  $("#repo-search").show();
}
function showAllRepositories() {
    $("#user-info").show();
    $("#search-bar").show();
    $("#repo-search").show();
    $("#showAllReposBtn").hide();
    document.getElementById("repo-search-input").value = "";
    fetchRepositories();
    displayPagination();
  }
  
function fetchUserInfo() {
  const username = document.getElementById("username").value;
  const url = `https://api.github.com/users/${username}`;

  $("#loader").show();

  $.get(url, function (data, status) {
    $("#loader").hide();

    if (status === "success") {
      showRepoSearchBar(data);

      fetchRepositories();
    } else {
      alert("Error fetching user data from GitHub API");
    }
  });
}

function displayUserInfo(user) {
  const userImage = document.getElementById("user-image");
  userImage.src = user.avatar_url;

  const userName = document.getElementById("user-name");
  userName.textContent = user.name || user.login;

  const githubLink = document.getElementById("github-link");
  githubLink.innerHTML = `<a href="${user.html_url}" target="_blank">${user.html_url}</a>`;

  $("#user-info").show();
}

function fetchRepositories() {
  const username = document.getElementById("username").value;
  const url = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${currentPage}`;

  $("#loader").show();

  $.ajax({
    url: url,
    method: "GET",
    success: function (data, status, xhr) {
      // Hide loader
      $("#loader").hide();

      if (status === "success") {
        const linkHeader = xhr.getResponseHeader("Link");
        if (linkHeader) {
          const lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
          totalRepositories = lastPageMatch
            ? parseInt(lastPageMatch[1]) * perPage
            : 0;
        } else {
          totalRepositories = data.length;
        }

        displayRepositories(data);

        displayPagination();
      } else {
        alert("Error fetching data from GitHub API");
      }
    },
  });
}
function displayRepositories(repositories) {
  const repoContainer = document.getElementById("repo-container");
  repoContainer.innerHTML = "";

  repositories.forEach((repo) => {
    const repoBox = document.createElement("div");
    repoBox.className = "col-md-4 repo-box"; // Adjusted class for Bootstrap grid

    const repoName = document.createElement("h3");
    repoName.textContent = repo.name;

    const repoDescription = document.createElement("p");
    repoDescription.textContent =
      repo.description || "No description available";

    const tagsContainer = document.createElement("div");
    tagsContainer.className = "tags-container";

    if (repo.languages_url) {
      fetch(repo.languages_url)
        .then((response) => response.json())
        .then((languages) => {
          const tags = Object.keys(languages);
          tags.forEach((tag) => {
            const tagBox = document.createElement("div");
            tagBox.className = "tag-box";
            tagBox.textContent = tag;
            tagsContainer.appendChild(tagBox);
          });
        })
        .catch((error) => {
          console.error("Error fetching languages:", error);
          const noTagsBox = document.createElement("div");
          noTagsBox.className = "tag-box";
          noTagsBox.textContent = "No tags";
          tagsContainer.appendChild(noTagsBox);
        });
    } else {
      const noTagsBox = document.createElement("div");
      noTagsBox.className = "tag-box";
      noTagsBox.textContent = "No tags";
      tagsContainer.appendChild(noTagsBox);
    }

    repoBox.appendChild(repoName);
    repoBox.appendChild(repoDescription);
    repoBox.appendChild(tagsContainer);

    repoContainer.appendChild(repoBox);
  });
}
function displayPagination() {
  const totalPages = Math.ceil(totalRepositories / perPage);
  const paginationDiv = document.querySelector(".pagination");
  paginationDiv.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
    paginationDiv.appendChild(li);
  }
}

function changePage(page) {
  currentPage = page;
  fetchRepositories();
}

function searchRepositories() {
  const searchTerm = document.getElementById("repo-search-input").value.trim();

  if (searchTerm === "") {
    alert("Please enter a search term.");
    return;
  }

  const username = document.getElementById("username").value;
  const url = `https://api.github.com/users/${username}/repos?per_page=${perPage}`;

  $("#loader").show();

  $.ajax({
    url: url,
    method: "GET",
    success: function (data, status) {
      $("#loader").hide();

      if (status === "success") {
        const filteredRepositories = data.filter((repo) =>
          repo.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        totalRepositories = filteredRepositories.length;

        displayRepositories(filteredRepositories);

        const paginationDiv = document.querySelector(".pagination");
        paginationDiv.innerHTML = "";
        $("#showAllReposBtn").show();
      } else {
        alert("Error fetching data from GitHub API");
      }
    },
  });
}
