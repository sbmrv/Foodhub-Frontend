import React from "react";
import "./Styles/filter.css";
import queryString from "query-string";
import axios from "axios";
import { getImageUrl } from "../utils/images";

class Filter extends React.Component {

    constructor(){
        super();
        this.state={
            locations:[],
            location:undefined,
            restaurants:[],
            count:undefined,
            mealtype:'',
            cuisine_id:[],
            lcost:undefined,
            hcost:undefined,
            sort:1,
            page:1,
            Count:undefined,
            pageCount:[],
            filterKey: 0,

        };
    }

    componentDidMount() {
        const qs = queryString.parse(this.props.location.search);
        const { mealtype , name , location} = qs;
        const {page} = this.state;
        this.setState({location:location})
        this.setState({mealtype:mealtype})
        console.log(name)
        console.log(mealtype);
        const sort = this.state;

        

    const filterObj = {
        mealType: Number(mealtype),
        location,
        sort,
        page
      };

        axios({
          method: "POST",
          url: `http://localhost:8050/AllFilters`,
          headers: { 'Content-Type': 'application/json' },
          data: filterObj
        })
          .then(response => {
            this.setState({
              restaurants: response.data.restaurants,
              Count:response.data.count,
              pageCount:response.data.pageCount
            });
          })
          .catch(err => console.log(err));

          axios({
            method:'GET',
            url:"http://localhost:8050/getAllLocations",
            headers:{'Content-Type':'application/json'}
        })
        .then(response =>{
            
            this.setState({
                locations:response.data.locations,
                Count:response.data.count,
                pageCount:response.data.pageCount
            })
        })
        .catch(err => console.log(err))

        

        //Didmount Ends here .....
      }

      handleLocationChange =async (event)=>{
        const location = event.target.value ;
        this.setState({location:event.target.value})
        const { mealtype } = queryString.parse(this.props.location.search); 
        const { cuisine_id , lcost , hcost , sort , page} = this.props;
        const filterObj = {
            mealType: Number(mealtype),
            location,
            cuisine:cuisine_id,
            lowCost:lcost,
            highCost:hcost,
            sort,
            page,
            
          };
         const response =await axios({
            method: "POST",
            url: `http://localhost:8050/AllFilters`,
            headers: { 'Content-Type': 'application/json' },
            data: filterObj
          })
            
              this.setState({
                restaurants: response.data.restaurants,
                location, 
                Count:response.data.count,
                pageCount:response.data.pageCount
              });
             
            
    }

    handleCuisineChnge = async (value)=>{
        const { mealtype } = queryString.parse(this.props.location.search);
        const {cuisine_id,location,lcost , hcost , sort , page} = this.state;
        console.log(location);

        const index = cuisine_id.indexOf(value);
        if(index == -1){
            cuisine_id.push(value);
        }else{
            cuisine_id.splice(index,1);
        }

        console.log(cuisine_id);
        const filterObj = {
            mealType: Number(mealtype),
            location,
            cuisine:cuisine_id.length === 0 ? undefined : cuisine_id,
            lowCost:lcost,
            highCost:hcost,
            sort,
            page
          };
         const response = await axios({
            method: "POST",
            url: `http://localhost:8050/AllFilters`,
            headers: { 'Content-Type': 'application/json' },
            data: filterObj
          })
          
            this.setState({
              restaurants: response.data.restaurants,
              location,
              cuisine_id, 
              Count:response.data.count,
              pageCount:response.data.pageCount
            });
           
         

    }

    handleCost =async (lcost , hcost)=>{
        console.log(lcost , hcost);
        const { mealtype } = queryString.parse(this.props.location.search);
        const {cuisine_id,location, sort , page} = this.state;

        const filterObj = {
            mealType: Number(mealtype),
            location,
            cuisine:cuisine_id.length === 0 ? undefined : cuisine_id,
            lowCost:lcost,
            highCost:hcost,
            sort,
            page
          };
         const response = await axios({
            method: "POST",
            url: `http://localhost:8050/AllFilters`,
            headers: { 'Content-Type': 'application/json' },
            data: filterObj
          })
          
            this.setState({
              restaurants: response.data.restaurants, 
              Count:response.data.count,
              lcost:lcost,
              hcost:hcost,
              pageCount:response.data.pageCount
            });
           
          
    }

    handleSort =async (sorting)=>{
        // console.log(sort);
        const { mealtype } = queryString.parse(this.props.location.search);
        const {cuisine_id,location, lcost,hcost,sort , page} = this.state;

        const filterObj = {
            mealType: Number(mealtype),
            location,
            cuisine:cuisine_id.length === 0 ? undefined : cuisine_id,
            lowCost:lcost,
            highCost:hcost,
            sort:sorting,
            page
          };
         const response = await axios({
            method: "POST",
            url: `http://localhost:8050/AllFilters`,
            headers: { 'Content-Type': 'application/json' },
            data: filterObj
          })
          
            this.setState({
              restaurants: response.data.restaurants, 
              Count:response.data.count,
              sort:sorting,
              pageCount:response.data.pageCount
            });
            console.log(this.state.sort)
           
         
    }

    handleReset = async () => {
        const qs = queryString.parse(this.props.location.search);
        const { mealtype, location: qsLocation } = qs;
        const location =
            qsLocation || sessionStorage.getItem("locationId") || undefined;

        const filterObj = {
            mealType: mealtype ? Number(mealtype) : undefined,
            location: location ? String(location) : undefined,
            sort: 1,
            page: 1,
        };

        try {
            const response = await axios({
                method: "POST",
                url: `http://localhost:8050/AllFilters`,
                headers: { "Content-Type": "application/json" },
                data: filterObj,
            });
            this.setState({
                location: location ? String(location) : undefined,
                cuisine_id: [],
                lcost: undefined,
                hcost: undefined,
                sort: 1,
                page: 1,
                restaurants: response.data.restaurants,
                Count: response.data.count,
                pageCount: response.data.pageCount,
                filterKey: this.state.filterKey + 1,
            });
        } catch (err) {
            console.log(err);
        }
    };

    pageChange = async(elem)=>{
        const page = elem.target.id;
        
        console.log(page);
        const { mealtype } = queryString.parse(this.props.location.search);
        const {cuisine_id,location, lcost,hcost,sort} = this.state;

        const filterObj = {
            mealType: Number(mealtype),
            location,
            cuisine:cuisine_id.length === 0 ? undefined : cuisine_id,
            lowCost:lcost,
            highCost:hcost,
            sort,
            page:page
          };
          const response = await axios({
            method: "POST",
            url: `http://localhost:8050/AllFilters`,
            headers: { 'Content-Type': 'application/json' },
            data: filterObj
          })
          
            this.setState({
              restaurants: response.data.restaurants, 
              Count:response.data.count,
              page:page,
              pageCount:response.data.pageCount
            });  
    }

    

    selectingRestaurant = (resObj)=>{
      console.log('detail')
      this.props.history.push(`/details?restaurants=${resObj._id}`)
  }

   

    

    
    render() {
       

        const {restaurants , Count , locations, pageCount, location, filterKey} = this.state;
        
        console.log('restaurants'+" "+Count);
        console.log('page Count'+" "+pageCount);
        return (
            <>
            
                <div className="container filterCont">
                    <div className="row d-flex justify-content-center ">
                        <div className="filter col-xl-4 col-lg-4 col-md-5 col-sm-10">
                            <h2>Filter</h2>

                            <div className="row">
                                <div className="content col-xl-10 col-lg-10 col-md-11 col-sm-11 " key={filterKey}>
                                    <div className="select">
                                        <h3>Select Location</h3>
                                        <select
                                            name="location"
                                            value={location || ""}
                                            onChange={this.handleLocationChange}
                                            className="form-select"
                                            id="select"
                                        >
                                            <option value="" disabled>Select Location</option>
                                            {locations.map((item) => (
                                                <option key={item._id} value={item.location_id}>
                                                    {item.name},{item.city}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="chbx">
                                        <h3>Cuisine</h3>
                                        <div className="check">
                                            <div><input type="checkbox" className="form-check-input" onChange={()=>this.handleCuisineChnge(1)} /> North India</div>
                                            <div> <input type="checkbox" className="form-check-input" onChange={()=>this.handleCuisineChnge(2)} /> South India</div>
                                            <div> <input type="checkbox" className="form-check-input" onChange={()=>this.handleCuisineChnge(3)} /> Chines</div>
                                            <div><input type="checkbox" className="form-check-input" onChange={()=>this.handleCuisineChnge(4)} /> Fast Food</div>
                                            <div><input type="checkbox" className="form-check-input" onChange={()=>this.handleCuisineChnge(5)} /> Street Food</div>
                                        </div>
                                    </div>

                                    <div className="cost">
                                        <h3>Cost for two</h3>
                                        <div className="rdo">
                                            <div><input type="radio" className="form-check-input" name="s" onChange={()=>this.handleCost(1, 500)} /> Less than Rs.500 </div>
                                            <div> <input type="radio" className="form-check-input" name="s" onChange={()=>this.handleCost(500 , 1000)} /> Rs.500 to Rs.1000</div>
                                            <div> <input type="radio" className="form-check-input" name="s" onChange={()=>this.handleCost( 1000 , 1500)} /> Rs.1000 to Rs.1500</div>
                                            <div><input type="radio" className="form-check-input" name="s" onChange={()=>this.handleCost( 1500 , 2000)} /> Rs.1500 to Rs.2000</div>
                                            <div><input type="radio" className="form-check-input" name="s" onChange={()=>this.handleCost( 2000 , 50000)} /> Rs.2000+</div>

                                        </div>
                                    </div>

                                    <div className="cost1">
                                        <h3>Sort</h3>
                                        <div className="rdo">
                                            <div><input className="form-check-input" type="radio" name="sn" onChange={()=>this.handleSort(1)} /> Price low to high</div>
                                            <div><input className="form-check-input" type="radio" name="sn" onChange={()=>this.handleSort(-1)} /> Price high to low</div>


                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-outline-danger filter-reset-btn"
                                        onClick={this.handleReset}
                                    >
                                        Reset filters
                                    </button>
                                </div>
                            </div>

                        </div>


                        <div className="result col-xl-8 col-lg-8 col-md-8 col-sm-10">
                            <div className="row d-flex justify-content-center align-items-center">


                            {restaurants.length> 0 ?   restaurants.map(item =>{
                                return(
                                    <div className="col-xl-11 col-lg-11 col-md-11 col-sm-11 card1" onClick={()=>this.selectingRestaurant(item)} >
                                    <div className="upper row">
                                        <img src={getImageUrl(item.image)} alt={item.name} className="col-xl-3 col-lg-3 col-md-3 col-sm-10" />
                                        <div className="content col-xl-9 col-lg-9 col-md-9 col-sm-11" >
                                            <h1>{item.name}</h1>
                                            <h4>{item.locality}</h4>
                                            <p>Shop1, plotD,{item.locality}, Pune, Maharashtra 411001.</p>
                                        </div>
                                    </div>

                                    <div className="lower">
                                        <div className="content">
                                            <p>CUISINES:{item.cuisine.map(cuisineItem =>{return<span>{cuisineItem.name}</span>})}</p>
                                            <p>COST FOR TWO: <span>&#8377;{item.min_price} </span></p>

                                        </div>
                                    </div>
                                </div>
                                )
                            }) : <div className="col-xl-11 col-lg-11 col-md-11 col-sm-11 card1">
                                    <div className="upper row">
                                        <img src="#" alt="data not found" className="col-xl-3 col-lg-3 col-md-3 col-sm-10" />
                                        <div className="content col-xl-9 col-lg-9 col-md-9 col-sm-11" >
                                            <h1 >No Data Found..</h1>
                                            <h4></h4>
                                            <p></p>
                                        </div>
                                    </div>

                                    <div className="lower">
                                        <div className="content">
                                            <p>CUISINES:</p>
                                            <p>COST FOR TWO: </p>

                                        </div>
                                    </div>
                                </div>}



                                

                                {restaurants.length >0 ?
                                    <div className="card2">
                                    <button id="0">&lt;</button>
                                    {pageCount.map((pageNo) =>{
                                        
                                        return <button id={pageNo} onClick={(e)=>{
                                            this.pageChange(e)
                                        }}>{pageNo}</button>
                                    })}
                                    <button id="-1">&gt;</button>
                                </div> :
                                    null
                                }

                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default Filter;