import "./App.css"
import React, { useRef } from 'react'
import data from './data/data';
import { useMemo, useState } from 'react';

import {Charts, ChartContainer, ChartRow, YAxis, LineChart,styler} from "react-timeseries-charts";
import { Collection, TimeSeries, TimeEvent, TimeRange } from "pondjs";
import moment from "moment"



const  App = () => {
    const [campaignIdFilter, setCampaignIdFilter] = useState(null)
    const [customBeginningTime, setCustomBeginningTime] = useState(null)
    const [customEndingTime, setCustomEndingTime] = useState(null)

    const inputRef = useRef();


  // console.log(mainData.filter(dp => ))
  // console.log(mainData.filter(datapoint => datapoint.campaign_id === "110"))

    

    const {series, clicks, impressions} = useMemo(() => {
        
        let workingData = !campaignIdFilter ? 
                                data 
                                : data.filter(datapoint => datapoint.campaign_id === campaignIdFilter)
        const {clicks, impressions} = workingData.reduce((sum, dp) => {
            sum.clicks += +dp.clicks
            sum.impressions += +dp.impressions
            return sum
        },{clicks:0,impressions:0})

        if(customBeginningTime){
            workingData = workingData.filter(datapoint=>{
                const datumDate = new Date(datapoint.date)
                return datumDate > customBeginningTime
            })
        }

        if(customEndingTime){
            workingData = workingData.filter(datapoint=>{
                const datumDate = new Date(datapoint.date)
                return datumDate < customEndingTime
            })
        }

        const columns = ["time", "impressions", "clicks"]
        const events = workingData.map(item => {
            const timestamp = moment(new Date(item.date))
            const {impressions, clicks} = item
            return new TimeEvent(timestamp.toDate(), {
                impressions : +impressions,
                clicks : +clicks
            })
        })

        const collection = new Collection(events)

        const sortedCollection = collection.sortByTime()
        return {series : new TimeSeries({ name: "clicks-impressions", columns, collection: sortedCollection }),
                clicks,
                impressions
            };
    }, [campaignIdFilter, customBeginningTime, customEndingTime])

 
    const setCampaignId = () => {
        setCampaignIdFilter(inputRef.current.value)

    }
    
  
  const lineStyles = styler([{ key: "clicks", color: "orange" }, { key: "impressions", color: "steelblue" }]);
  
  const beginningTime = series._collection._eventList.size > 0 ? customBeginningTime || (series && series.begin() ) : null
  const endingTime = series._collection._eventList.size > 0 ? customEndingTime || (series && series.end()) : null
//   console.log(beginningTime.toLocaleDateString("en-CA"))

  const handleDateChange = e => {
    console.log(e.target.name, e.target.value)
    if(e.target.name === "beginDate"){
        setCustomBeginningTime(new Date(e.target.value))
    }
    if(e.target.name === "endDate"){
        setCustomEndingTime(new Date(e.target.value))
    }
  }

  return (
    <div class="main">
        <div className="datePicker">
            {series._collection._eventList.size > 0 && <>
                <div>From : <input type="date" value={beginningTime.toLocaleDateString("en-CA")} onChange={handleDateChange} name="beginDate"/></div>
                <div>To : <input type="date" value={endingTime.toLocaleDateString("en-CA")} onChange={handleDateChange} name="endDate"/></div>
            </>
            }
        </div>
        <div className="chart">
            {series._collection._eventList.size > 0  ? <ChartContainer timeRange={series.timerange()} width="1200">
                <ChartRow height="600">
                    <YAxis id="axis1" label="Clicks" min={0} max={400} width="100" type="linear"/>
                    <Charts>
                        <LineChart axis="axis1" series={series} columns={["clicks"]} style={lineStyles}/>
                        <LineChart axis="axis2" series={series} columns={["impressions"]} style={lineStyles}/>
                    </Charts>
                    <YAxis id="axis2" label="Impressions" min={0} max={10000} width="100" type="linear" />
                </ChartRow>
            </ChartContainer>
            : <div className="chart_error">Invalid campaign id</div>}
        </div> 
        <div className = "stats">
            <div>{`Clicks : ${(Math.round(clicks*100)/100).toFixed(2)}`}</div>
            <div>{`Impressions : ${impressions}`}</div>

        </div>
        <div className="campaign_input">
            Enter Campaign id: 
            <input type="text" id="campaign_id_input" ref={inputRef}/> 
            <button onClick={setCampaignId}>Go</button>
            
        </div>
    </div>
  )
}

export default App