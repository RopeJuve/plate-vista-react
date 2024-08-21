import React from 'react'
import { ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject, Legend, Tooltip, Category, DataLabel, ColumnSeries } from '@syncfusion/ej2-react-charts';
import Header from '../../components/AdminComponents/Header';
import { barCustomSeries, barPrimaryXAxis, barPrimaryYAxis } from '../../data/data';
import { useStateContext } from '../../contexts/ContextProvider';

const Bar = () => {

    const { currentMode } = useStateContext();
  
    return (
      <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header title="Best Employees" />
  <ChartComponent
    id='bar-chart'
    height='400px'
    primaryXAxis={barPrimaryXAxis}
    primaryYAxis={barPrimaryYAxis}
    chartArea={{ border: { width: 0 } }}
    tooltip={{ enable: true }}
    // background={currentMode === 'Dark' ? '#33373E' : '#fff'}
    >
      <Inject services={[ColumnSeries, Legend, Tooltip, DataLabel, Category]} />
      <SeriesCollectionDirective>
        {barCustomSeries.map((item, index) => 
        <SeriesDirective key={index} {...item}/>)}
      </SeriesCollectionDirective>
    </ChartComponent>
      </div>
    
    );
  };

export default Bar


