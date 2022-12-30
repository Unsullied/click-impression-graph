I have used `react-timeseries-charts` to plot the fraph alongside `pondjs` to convert the raw data to a timeseries so that, the data is plotted with respect to time. 

The series is memoized to prevent repeatitive calculation of the same in case of re-renders. Data is being read from `data.js` within the data folder

For styling I have kept very simple css with some usage of flex.

The app is built using node 16

#npm i
#npm start