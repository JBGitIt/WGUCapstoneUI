import SideNavbar from "../Components/SideNavbar";
import MainContent from "../Components/MainContent";
import Dropdown from "../Components/Dropdown";
import CMDLine from '../assets/CMDLine.png';

function Home() {
    return (
        <div className="d-flex flex-grow-1">
            <SideNavbar />
            <MainContent>
                <div>
                    <h2>Welcome to my Capstone Project!</h2>
                    <p>
                        This home page is meant to serve as your guide to all the necessary pieces of the project for your review.
                        It does not provide a comprehensive review of all code and functions of the project but if there are other pieces you wish to see there is much available throughout this web interface and ALL the code is available on my <a href="https://github.com/JBGitIt/WGUCapstoneUI/tree/master">GitHub</a>.
                    </p>
                    <p>
                        Sections A and B were included with my submission as two Word documents and one Excel sheet. Below are hyperlinks and/or explanations to point you toward the requirements for section C and D.
                    </p>
                    <h3>Section C</h3>
                    <ul>
                        <li>
                            <a href="/Model/Training#:~:text=This%20is%20the%20parent%20method%20of%20the%20whole%20process%2C%20it%20lives%20in%20the%20Arborist%20class.%20If%20you%20need%20to%20see%20the%20rest%20of%20the%20Arborist%20class%20it%20can%20be%20found%20on%20at%20GITHUBLINK">One descriptive method</a><span> & </span><a href="https://localhost:5173/Model/Validation#:~:text=The%20is%20also,1">one nondescriptive (predictive or prescriptive) method</a>
                        </li>
                        <li>
                            <a href="/Data/RawData">Collected or available datasets</a>
                        </li>
                        <li>
                            <a href="/Model/Visualization">Decision support functionality</a>
                        </li>
                        <li>
                            <span>Ability to support </span><a href="/Data/AdjustData#:~:text=SQL%20Procedures%20to%20adjust%20the%20data%20in%20the%20DB">featurizing parsing cleaning & wrangling </a><span>datasets.</span>
                        </li>
                        <li>
                            <h5>Methods and algorithms supporting data exploration and inspection</h5>
                            <p>
                                The inspection process for my data sets was pretty manual. The first thing I did was determine the earliest date available in ALL the data sets and then created a list of month end dates from that date to the present.
                                Then I ran all the data series through the methods available at the <a href="/Data/AdjustData#:~:text=SQL%20Procedures%20to%20adjust%20the%20data%20in%20the%20DB">AdjustData</a> page.
                                This gave me a well formed time-series data set to work with.
                            </p>
                        </li>
                        <li>
                            <a href="/Model/Visualization">Data visualization functionalities for data exploration and inspection</a>
                        </li>
                        <li>
                            <a href="/Data/DataVisualization">Implementation of interactive queries</a>
                        </li>
                        <li>
                            <a href="/Model/Training">Implementation of machine-learning methods and algorithms</a>
                        </li>
                        <li>
                            <a href="/Model/Validation">Functionalities to evaluate the accuracy of the data product</a>
                        </li>
                        <li>
                            <h6>Industry-appropriate security features</h6>
                            <p>
                               As this product works exclusively with public datasets I have implemented no special security measures for access. The integrity of the database is protected by having all queries run as parameterized stored procedures.
                               In a real world setting the SQL connections would be set up to use pass-through authentication if we only intended the product for use within the organization,
                               otherwise we would configure a service account that only had the ability to execute the necessary stored procedures. Even without these safe-guards, it would be very difficult to perform any sort of SQL focused attack on the database.
                               As I am using a sqlexpress instance in Azure to host the data I cannot configure a service account, and I do not have access to the WGU active directory. Therefore, security simply relies on the queries being parameterized and in the form of stored procedures.
                            </p>
                        </li>
                        <li>
                            <a href="/Model/Visualization">Tools to monitory and maintain the product</a>
                            <p>New data can be run through the system at the above link, The product is maintained through Azure. For the on-prem solution I propose in the hypothetical scenario the product would be monitored and maintained in IIS, SSMS, and Visual Studio.</p>
                        </li>
                        <li>
                            <a href="/Model/Visualization">A user friendly functional dashboard the includes three (  </a><a href="/Model/Visualization">1,   </a><a href="/Data/DataVisualization">2,   </a><a href="/Data/Hypothesis">3)  </a><span> visualization types (click the numbers to navigate to the different visualizations)</span>
                        </li>
                    </ul>
                    <h3>Section D</h3>
                    <ul>
                        <li>
                            <h6>A business vision or business requirements</h6>
                            <p>
                                - A UI for end-user engagement with the trained model
                            </p>
                            <p>
                                - A database for storing data used to train the model as well as the model itself
                            </p>
                            <p>
                                - Training for end-users on the use of the model and how to interpret the output of the model.
                            </p>
                        </li>
                        <li>
                            <a href="/Data/RawData">Raw </a><span>& </span><a href="/Data/AdjustData">cleaned </a><span>datasets</span>
                        </li>
                        <li>
                            <a href="/Model/Training">Code used to perform the analysis of the data and construct a descriptive, predictive, or prescriptive data product</a>
                        </li>
                        <li>
                            <a href="/Data/Hypothesis">Assesment of the hypotheses for acceptance or rejection</a>
                        </li>
                        <li>
                            <h6>Visualizations and elments of effective storytelling supporting the data exploration and preparation, data analysis, data summary, including the phenomenon and its detection</h6>
                            <p>I believe flipping through the above links provides the needed visualizations and storytelling.</p>
                        </li>
                        <li>
                            <a href="/Model/Validation">Assesment of the products accuracy</a>
                        </li>
                        <li>
                            <h6>The results from the data product testing, revisions, and optimization based on the provided plans, including screenshots</h6>
                            <p>My model started as a simple command line interface:</p>
                            <img src={CMDLine} />
                            <p>
                                Before turning into the full web app you see now. I shifted from the simple command line application to the more complex web app upon realizing the importance of visuals.
                                I also thought it would be neat to have the majority of the project be a hosted web page.
                            </p>
                        </li>
                        <li>
                            <a href="https://github.com/JBGitIt/WGUCapstoneUI/tree/master">Source code and executable files</a>
                        </li>
                        <li>
                            <h6>A quick-start guide summarizing the steps necssary to install and use the product</h6>
                            <p>No installation necessary. To make use of the model simply navigate <a href="/Model/Visualization">here</a> and pick your model and version (I do not recommend version 1 of any model as these are unvalidated)</p>
                        </li>
                    </ul>
                    <a>Sources</a>
                </div>
            </MainContent>
        </div>
    );
}

export default Home;