LumaMath Architecture Summary
App Routing and Main Layout

src/App.js: Defines main routes.

Javascript

Apply
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainLayout from './components/MainLayout';

const App = () => (
<Router>
<MainLayout />
<Switch>
<Route path="/lesson/:id" component={LessonPage} />
{/* Other routes */}
</Switch>
</Router>
);
export default App;
src/components/MainLayout.js: Provides the main layout structure.

Javascript

Apply
const MainLayout = () => (
  <div className="main-layout">
    {/* Header, Footer, and Sidebar */}
    <Route exact path="/" component={Home} />
    <Switch>
      {/* Other routes */}
    </Switch>
  </div>
);
export default MainLayout;
Lesson Page Flow

src/components/LessonPage.js: Displays a lesson based on the route parameter.
Javascript

Apply
const LessonPage = ({ match }) => {
const { id } = match.params;
const lesson = useFetch(`data/curriculum.json`).find(l => l.id === id);

return (
<div>
{lesson.sections.map(section => (
<section key={section.id}>
{/* Render section based on type */}
</section>
))}
</div>
);
};
export default LessonPage;
Learn Pages

src/components/LearnPage.js: Manages different Learn sections.
Javascript

Apply
const LearnPage = ({ match }) => {
const { id } = match.params;
const lesson = useFetch(`data/curriculum.json`).find(l => l.id === id);

return (
<div>
{lesson.sections.map(section => (
<section key={section.id}>
{/* Render Learn section based on type */}
</section>
))}
</div>
);
};
export default LearnPage;
Try It Screen

src/components/TryItScreen.js: Allows students to practice solving problems.
Javascript

Apply
const TryItScreen = () => {
// Fetch and render problem sets or questions
return <div>Try It Screen</div>;
};
export default TryItScreen;
Guided Practice, Independent Practice, Challenge Practice

src/components/GuidedPractice.js: Guided practice component.

Javascript

Apply
const GuidedPractice = () => {
// Fetch and render guided practice questions
return <div>Guided Practice</div>;
};
export default GuidedPractice;
src/components/IndependentPractice.js: Independent practice component.

Javascript

Apply
const IndependentPractice = () => {
// Fetch and render independent practice questions
return <div>Independent Practice</div>;
};
export default IndependentPractice;
src/components/ChallengePractice.js: Challenge practice component.

Javascript

Apply
const ChallengePractice = () => {
// Fetch and render challenge practice questions
return <div>Challenge Practice</div>;
};
export default ChallengePractice;
Curriculum / Lesson JSON Data Structure

data/curriculum.json: Defines the curriculum structure.
Json

Apply
{
"lessons": [
{
"id": "lesson-1",
"title": "Introduction to Numbers",
"sections": [
{
"id": "section-1.1",
"type": "BigIdea",
"content": "Numbers represent quantities."
}
]
}
]
}
Flashcards

src/components/Flashcard.js: Displays a single flashcard.

Javascript

Apply
const Flashcard = ({ front, back }) => (
  <div className="flashcard">
    <div>{front}</div>
    <div>{back}</div>
  </div>
);
export default Flashcard;
data/flashcardsData.json: Contains flashcard data.

Json

Apply
{
"flashcards": [
{ "id": "1", "front": "2 + 2?", "back": "4" },
// Other flashcards
]
}
Student Progress, Lesson Completion, and Unlock Logic

src/store/progressStore.js: Manages student progress.

Javascript

Apply
import { createStore } from 'redux';

const initialState = {
completedLessons: [],
};

const reducer = (state = initialState, action) => {
switch (action.type) {
case 'COMPLETE_LESSON':
return { ...state, completedLessons: [...state.completedLessons, action.id] };
default:
return state;
}
};

const progressStore = createStore(reducer);
export default progressStore;
src/utils/unlockLogic.js: Contains logic for unlocking new content.

Javascript

Apply
const unlockNewContent = () => {
// Logic to determine if new content can be unlocked
};
export { unlockNewContent };
Mascot / StarName Usage

src/components/Mascot.js: Mascot component.
Javascript

Apply
const Mascot = ({ starName }) => (
  <div className="mascot">
    {/* Mascot image and starName */}
  </div>
);
export default Mascot;
Free vs Premium Locks

data/locks.json: Defines which sections are free or premium.

Json

Apply
{
"locks": [
{ "id": "lesson-1.2", "isPremium": true },
// Other locks
]
}
src/utils/lockLogic.js: Contains logic for handling locks and unlocking content.

Javascript

Apply
const isSectionLocked = (sectionId) => {
const lock = useFetch(`data/locks.json`).find(l => l.id === sectionId);
return lock.isPremium && !progressStore.getState().completedLessons.includes(lock.id);
};
export { isSectionLocked };
Key Files That Control Each Major Feature

src/App.js: Main routing.
src/components/MainLayout.js: Layout structure.
src/components/LessonPage.js, src/components/BigIdeaSection.js, etc.: Individual components for lessons, practices, and flashcards.
data/curriculum.json: Curriculum and lesson structure.
data/flashcardsData.json: Flashcard data.
src/store/progressStore.js: Progress management.
src/utils/unlockLogic.js, src/utils/lockLogic.js: Logic for unlocking content.
Risks or Confusing Areas

Hardcoded Content: Mascot images and starNames are hardcoded.
Complexity in Unlock Logic: The logic for unlocking new content is complex.
Data Fetching: Ensure all components fetch correct data from curriculum and flashcard files.
UI Consistency: Maintain consistent UI elements across different screens.
This summary provides a clear overview of LumaMath's architecture, ensuring you have a comprehensive understanding before making any changes. If you need specific edits or further details, feel free to ask!
