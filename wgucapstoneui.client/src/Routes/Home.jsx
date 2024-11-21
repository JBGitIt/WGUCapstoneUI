import SideNavbar from "../Components/SideNavbar";
import MainContent from "../Components/MainContent";
function Home() {
    return (
        <div className="d-flex flex-grow-1">
            <SideNavbar />
            <MainContent />
        </div>
    )
}

export default Home;