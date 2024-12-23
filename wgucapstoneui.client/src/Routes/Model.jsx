import SideNavbar from "../Components/SideNavbar";
import MainContent from "../Components/MainContent";
import Dropdown from "../Components/Dropdown";
function Model() {
    return (
        <div className="d-flex flex-grow-1">
            <SideNavbar Links={[
                { link: "/Model/Training", label: "Training the Model" }
                , { link: "/Model/Validation", label: "Validating the Model" }
                , { link: "/Model/Visualization", label: "Visualizing the Data" }
            ]} />
            <MainContent>
                <div>
                    <h3>The Model</h3>
                    <p>I built my own random forest algorithm in C# for use with this project.
                       I may have been able to make something more accurate or devoted more time to expanding functionality
                       if I had used established libraries but I would not have learned nearly as much.
                       My model is very basic using Gini Impurity to find the best thresholds in each node
                       and testing against ranges for numeric values and each unique value for features that are not numeric in nature.

                       The full code of my model can be found on my GitHub GITHUBLINK.
                    </p>
                </div>
            </MainContent>
        </div>
    );
}

export default Model;