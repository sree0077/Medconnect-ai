
import jsonfile from "jsonfile"
import moment from "moment"
import simpleGit from "simple-git";
const path = "./data.json";

// Generate random dates between April 7th and July 26th
const generateRandomDates = (numberOfCommits, year = 2025) => {
  const startDate = moment(`${year}-03-07`);
  const endDate = moment(`${year}-06-26`);
  const dates = [];

  for (let i = 0; i < numberOfCommits; i++) {
    const randomTime = Math.random() * (endDate.valueOf() - startDate.valueOf());
    const randomDate = moment(startDate.valueOf() + randomTime);
    
    // Add random hour and minute for more realistic commits
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);
    
    randomDate.hour(randomHour).minute(randomMinute).second(0);
    dates.push(randomDate.format('YYYY-MM-DD HH:mm:ss'));
  }

  // Sort dates chronologically so commits appear in order
  return dates.sort();
};

// Generate your random dates
const randomDates = generateRandomDates(20, 2025); // 20 commits in 2025

const makeCommits = (n) => {
  if (n == 0) return simpleGit().push();
  
  // Use the pre-generated random date for this commit
  const commitDate = randomDates[20 - n]; // Get date from array
  
  const data = {
    date: commitDate,
    commit: 20 - n + 1 // Commit number
  };

  jsonfile.writeFile(path, data, () => {
    simpleGit()
      .add([path])
      .commit(commitDate, {'--date': commitDate}, makeCommits.bind(this, --n));
  });
};

makeCommits(100);
