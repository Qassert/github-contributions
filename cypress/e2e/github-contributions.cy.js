context('github api', function () {

  const githubOwner = 'githubtraining';
  const githubRepo = 'hellogitworld';

  it('i want to see the authors of the last 30 commits in a GitHub repo of my choosing', function () {
    
    const numberofCommitstoCheck = 30;
    let results = {};
    let commitsAuthoredCount = 0;

    cy.get_contributors_for_specified_owner_and_repo(githubOwner, githubRepo)
      .its('body').as('contributors');

    cy.get_commits_for_specified_owner_and_repo(githubOwner, githubRepo, numberofCommitstoCheck)
      .its('body').as('commits')
      .its('length').as('commitsFound')

      .then(function () {

        this.contributors.forEach(contributor => {
          results[contributor.login] = 0;
        })
        
        this.commits.forEach(commit => {
          if (commit.author != null) {
            results[commit.author.login] += 1;
            commitsAuthoredCount += 1;
          }
        })

        const noAuthorCommits = this.commitsFound - commitsAuthoredCount;

        cy.log(`Looked for ${numberofCommitstoCheck} commits, ${this.commitsFound} were found`);
        cy.log(`Number of commits encountered with no author present: ${noAuthorCommits}`);
        cy.logToTxtFile('githubContributions', `Looked at github owner ${githubOwner}, against repo: ${githubRepo}`);
        cy.logToTxtFile('githubContributions', `Report Date: ${new Date().toJSON()}`);
        cy.logToTxtFile('githubContributions', `Looked for ${numberofCommitstoCheck} commits, ${this.commitsFound} where found`);
        cy.logToTxtFile('githubContributions', `Number of commits encountered with no author present: ${noAuthorCommits}`);
        
        for (const [contributor, result] of Object.entries(results)) {
          let output =  `Contributor: ${contributor} made ${result} commits from the last ${this.commitsFound} commits`
          cy.logToTxtFile('githubContributions', output);
          cy.log(output);
        }
    })
  });

  it('i want to see 404 response and feedback from contributor request with invalid owner in URL', function () {

    const githubOwnerInvalid = 'githubtrainingXX';
    cy.get_contributors_for_specified_owner_and_repo(githubOwnerInvalid, githubRepo)

      .then(response => {
        assert.equal(response.status, '404', 'Check: Ensure correct response code for request with invalid owner in url');
        assert.equal(response.body.message, 'Not Found', 'Check: Ensure correct feedback for request with invalid repo in url');
        // The AC specifically requests the feedback text: [Either owner or repo does not exist on GitHub]
        // So unsure of whether to check for that and have a failing test - or go with the Not found response
      })
  });

  it('i want to see 404 response and feedback from contributor request with invalid repo in URL', function () {

    const githubRepoInvalid = 'hellogitworldsXX';
    cy.get_contributors_for_specified_owner_and_repo(githubOwner, githubRepoInvalid)

      .then(response => {
        assert.equal(response.status, '404', 'Check: Ensure correct response code for request with invalid repo in url');
        assert.equal(response.body.message, 'Not Found', 'Check: Ensure correct feedback for request with invalid repo in url');
        // The AC specifically requests the feedback text: [Either owner or repo does not exist on GitHub]
        // So unsure of whether to check for that and have a failing test - or go with the Not found response
      })
  });

  Cypress.Commands.add(
    'logToTxtFile', 
    (filename, text) => {
      cy.writeFile(`cypress/reports/${filename}.txt`, `\r\n${text}`, { flag: 'a+', log: false })
  });

  Cypress.Commands.add(
    'get_contributors_for_specified_owner_and_repo', 
    (owner, repo) => {
      cy.request({
        url: `/repos/${owner}/${repo}/contributors`, 
        failOnStatusCode: false
      })
  });

  Cypress.Commands.add(
    'get_commits_for_specified_owner_and_repo', 
    (owner, repo, numberofCommitstoCheck) => {
      cy.request({
        url: `/repos/${owner}/${repo}/commits`, 
        failOnStatusCode: false,
        qs: {per_page: numberofCommitstoCheck}
      })
  });

});
  