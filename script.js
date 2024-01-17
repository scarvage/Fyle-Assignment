const perPage = 10;
    let currentPage = 1;
    let totalRepositories = 0;

    function fetchUserInfo() {
      const username = document.getElementById('username').value;
      const url = `https://api.github.com/users/${username}`;

      // Show loader
      $('#loader').show();

      $.get(url, function (data, status) {
        // Hide loader
        $('#loader').hide();

        if (status === 'success') {
          // Display user information
          displayUserInfo(data);

          // Fetch repositories
          fetchRepositories();

          // Hide search bar
          $('#search-bar').hide();
        } else {
          alert('Error fetching user data from GitHub API');
        }
      });
    }

    function displayUserInfo(user) {
      const userImage = document.getElementById('user-image');
      userImage.src = user.avatar_url;

      const userName = document.getElementById('user-name');
      userName.textContent = user.name || user.login;

      const githubLink = document.getElementById('github-link');
      githubLink.innerHTML = `<a href="${user.html_url}" target="_blank">${user.html_url}</a>`;

      // Show user info section
      $('#user-info').show();
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
              totalRepositories = lastPageMatch ? parseInt(lastPageMatch[1]) * perPage : 0;
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
      const repositoriesDiv = document.getElementById('repositories');
      repositoriesDiv.innerHTML = '';

      repositories.forEach(repo => {
        const repoElement = document.createElement('div');
        repoElement.innerHTML = `<p><strong>${repo.name}</strong>: ${repo.description || 'No description available'}</p>`;
        repositoriesDiv.appendChild(repoElement);
      });
    }

    function displayPagination() {
      const totalPages = Math.ceil(totalRepositories / perPage);
      const paginationDiv = document.querySelector('.pagination');
      paginationDiv.innerHTML = '';

      for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        paginationDiv.appendChild(li);
      }
    }

    function changePage(page) {
      currentPage = page;
      fetchRepositories();
    }
