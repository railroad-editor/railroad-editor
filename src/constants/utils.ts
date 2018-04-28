
export const getClosest = (number: number, array: number[]) => {
  return array.reduce((prev, curr) => {
    return (Math.abs(curr - number) < Math.abs(prev - number) ? curr : prev);
  })
}

