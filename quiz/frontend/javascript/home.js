document.getElementById('start-button').addEventListener('click', () => {
    const numOfQuestions = document.getElementById('num-of-questions').value;
    window.location.href = `quiz.html?numOfQuestions=${numOfQuestions}`;
});