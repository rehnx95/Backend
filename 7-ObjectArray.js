function getsquare(arr) {
  let ans = [];
  for (let i = 0; i < arr.length; i++) {
    ans.push(arr[i] * arr[i]);
  }
  return ans;
}

let numbersArr = [1, 2, 3, 4];
console.log(getsquare(numbersArr));

function score(arr) {
  let highest = Math.max(...arr);
  let passedarr = arr.filter((n) => n >= 40);
  let failedarr = arr.filter((n) => n < 40);
  let sum = arr.reduce((acc, n) => acc + n, 0);
  let avg = sum / arr.length;
  let grade;
  if (avg >= 90) {
    grade = "A";
  } else if (avg >= 75) {
    grade = "B";
  } else if (avg >= 40) {
    grade = "C";
  } else {
    grade = "F";
  }
  let obj = {
    pass: passedarr,
    fail: failedarr,
    average: avg,
    high: highest,
    grade: grade,
  };
  return obj;
}

let scoresArr = [45, 92, 30, 88, 67];
console.log(score(scoresArr));

function result(students) {
  const studentmarks = students.map((x) => {
    const sum = x.marks.reduce((a, b) => a + b, 0);
    const avg = sum / x.marks.length;
    let status;
    if (avg >= 40) {
      status = "pass";
    } else {
      status = "fail";
    }
    return { name: x.name, average: avg, status: status };
  });

  const high = Math.max(...students.map((x) => x.marks.reduce((a, b) => a + b, 0) / x.marks.length));
  
  const highestStudent = studentmarks.find((s) => s.average === high);

  console.log(studentmarks);
  console.log("Highest Average Student:", highestStudent.name);
}

const students = [
  { name: "Rehan", marks: [80, 90, 70] },
  { name: "Aman", marks: [40, 30, 20] },
  { name: "Priya", marks: [95, 98, 92] },
  { name: "Ravi", marks: [60, 55, 50] },
];
result(students);
