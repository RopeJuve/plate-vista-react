import React from 'react'
import { ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject, Legend, Category, StackingBarSeries, Tooltip } from '@syncfusion/ej2-react-charts';
import { stackedCustomSeries, stackedPrimaryXAxis, stackedPrimaryYAxis } from '../../../data/data';
import Header from '../../../components/AdminComponents/Header'

const Stacked = ({ width, height }) => {
  return (
<div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header title="Total Orders" />
    <ChartComponent
      id="stack chart"
      primaryXAxis={stackedPrimaryXAxis}
      primaryYAxis={stackedPrimaryYAxis}
      width={width}
      height={height}
      chartArea={{ border: { width: 0 } }}
      tooltip={{ enable: true }}
      legendSettings={{ background: 'white' }}
    >
      <Inject services={[StackingBarSeries, Category, Legend, Tooltip]} />
      <SeriesCollectionDirective>
        {stackedCustomSeries.map((item, index) => <SeriesDirective key={index} {...item} />)}
      </SeriesCollectionDirective>
    </ChartComponent>
  </div>
  )
  
}

export default Stacked
