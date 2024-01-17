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


function fetchUserInfo() {
    const username = document.getElementById("username").value;
    const url = `https://api.github.com/users/${username}`;
  
    $("#loader").show();
    console.log(url);
  
    $.ajax({
      url: url,
      method: 'GET',
      success: function (data, status) {
        $("#loader").hide();
        console.log(data);
        if (status === 'success') {
          // User found, hide the user-not-found message if it's currently displayed
          $("#user-not-found-message").hide();
          showRepoSearchBar(data);
          fetchRepositories();
        } else {
          console.log("Error fetching user data from GitHub API");
          // Display an error message on the screen if the request fails
        }
      },
      error: function (xhr, status, error) {
        $("#loader").hide();
        if (xhr.status === 404) {
          // User not found, display the message on the screen
          $("#user-not-found-message").show();
        } else {
          console.log("Error fetching user data from GitHub API");
          // Display an error message on the screen if the request fails
        }
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
    const username = document.getElementById('username').value;
    const url = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${currentPage}`;
  
    // Show loader
    $('#loader').show();
  
    $.ajax({
      url: url,
      method: 'GET',
      success: function (data, status, xhr) {
        // Hide loader
        $('#loader').hide();
  
        if (status === 'success') {
          // Set totalRepositories
          const linkHeader = xhr.getResponseHeader('Link');
          if (linkHeader) {
            const lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
            totalRepositories = lastPageMatch ? parseInt(lastPageMatch[1]) * perPage : (data.length === perPage ? perPage * currentPage : (perPage * (currentPage - 1) + data.length));
          } else {
            totalRepositories = data.length;
          }
  
          // Display repositories
          displayRepositories(data);
  
          // Display pagination
          displayPagination();
        } else {
          alert('Error fetching data from GitHub API');
        }
      }
    });
  }
function displayRepositories(repositories) {
    const repoContainer = document.getElementById('repo-container');
    repoContainer.innerHTML = '';
  
    repositories.forEach(repo => {
      const repoBox = document.createElement('div');
      repoBox.className = 'col-md-4 repo-box';  // Adjusted class for Bootstrap grid
  
      const repoName = document.createElement('h3');
      repoName.textContent = repo.name;
  
      const repoDescription = document.createElement('p');
      repoDescription.textContent = repo.description || 'No description available';
  
      // Create a separate box for tags
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'tags-container';
  
      // Display all tags (languages) individually
      if (repo.languages_url) {
        fetch(repo.languages_url)
          .then(response => response.json())
          .then(languages => {
            const tags = Object.keys(languages);
            tags.forEach(tag => {
              const tagBox = document.createElement('div');
              tagBox.className = 'tag-box';
              tagBox.textContent = tag;
              tagsContainer.appendChild(tagBox);
            });
          })
          .catch(error => {
            console.error('Error fetching languages:', error);
            const noTagsBox = document.createElement('div');
            noTagsBox.className = 'tag-box';
            noTagsBox.textContent = 'No tags';
            tagsContainer.appendChild(noTagsBox);
          });
      } else {
        const noTagsBox = document.createElement('div');
        noTagsBox.className = 'tag-box';
        noTagsBox.textContent = 'No tags';
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

function searchRepositories(event) {
    // Prevent the default form submission behavior
    event.preventDefault();
  
    const searchTerm = document.getElementById('repo-search-input').value.trim();
    if (searchTerm === '') {
      alert('Please enter a search term.');
      return;
    }
  
    const username = document.getElementById('username').value;
    const url = `https://api.github.com/users/${username}/repos?per_page=${totalRepositories + 100}`;
  
    // Show loader
    $('#loader').show();
  
    $.ajax({
      url: url,
      method: 'GET',
      success: function (data, status) {
        // Hide loader
        $('#loader').hide();
  
        // Clear previous search results
        clearPreviousResults();
  
        if (status === 'success') {
          // Filter repositories based on the search term
          const filteredRepositories = data.filter(repo => repo.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
          // Set totalRepositories
          totalRepositories = filteredRepositories.length;
  
          // Display filtered repositories
          displayRepositories(filteredRepositories);
  
          // Hide pagination for search results
          const paginationDiv = document.querySelector('.pagination');
          paginationDiv.innerHTML = '';
          // Show the "Show All Repositories" button after a successful search
          $('#showAllReposBtn').show();
        } else {
          // Display error message
          displayErrorMessage('Error fetching data from GitHub API');
        }
      },
      error: function (xhr, status, error) {
        // Hide loader
        $('#loader').hide();
  
        // Clear previous search results
        clearPreviousResults();
  
        if (xhr.status === 404) {
          // Display error message for user not found
          displayErrorMessage('User does not exist. Please enter a valid username.');
        } else {
          // Display general error message
          displayErrorMessage('Error fetching data from GitHub API');
        }
      }
    });
  }
  function clearPreviousResults() {
    const repoContainer = document.getElementById('repo-container');
    repoContainer.innerHTML = '';
  
    $('#user-not-found-message').hide();
  }
  
  function displayErrorMessage(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }