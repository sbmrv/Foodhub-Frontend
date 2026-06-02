import React from "react";
import "./Styles/home.css";
import { withRouter } from "react-router-dom";
import QuickSearchItem from "./QuickSearchItem";

const container1 = {
  height: "500px",
  background: "url('./Assets/banner.avif') no-repeat center/cover",
};

class QuickSearch extends React.Component {
 

  render() {
    const { quickSearchData } = this.props;
    return (
      <div>
        {/*  banner ends */}

        <div className="container mt-3">
          <h1>Quick searches</h1>
          <p>Experience fast & easy online ordering
on the Zomato app!
          </p>
        </div>
        {/* <!-- cards starts  --> */}
        <div className="container bctn d-flex justify-content-center flex-column align-items-center mt-5 mrb">
          <div className="row g-3 mb-5 d-flex justify-content-center align-items-center ">
            {quickSearchData.map((item) => {
              const { name, content, image, mealtype_id } = item;
              return (
                <>
                  <QuickSearchItem quickSearchItemData={item} />
                </>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default QuickSearch;

{
  /* <div className="col-xl-4 col-lg-4 col-md-6 col-sm-11" onClick={this.handleNavigate(item.mealtype_id)}>
                                <div className="card">
                                    <img src={item.image} alt="image not found" />
                                    <div className="content1 p-2">
                                        <h2>{item.name}</h2>
                                        <p>{item.content}</p>
                                    </div>
                                </div>
                            </div> */
}
