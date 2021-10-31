import * as d3 from 'd3'

export default {
  memberValue: 10,
  padding: {
    circle: 40,
    membersCircle: 20,
    member: 20,
  },
  zoom: {
    scaleExtent: [0.1, 5],
    transition: d3.easeCubicInOut,
    duration: 500,
  },
  highlight: {
    transition: d3.easeCircleOut,
    duration: 150,
    increaseRadius: 5,
  },
  move: {
    transition: d3.easeCubicInOut,
    duration: 500,
  },
  remove: {
    transition: d3.easeQuadIn,
    duration: 150,
  },
  addMenu: {
    marginTop: 56,
    padding: 10,
    spacing: 5,
    placeholderRadius: 25,
  },
}
