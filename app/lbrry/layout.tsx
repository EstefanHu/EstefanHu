type Props = {
  children: React.ReactNode;
}

const layout = (props: Props) => {
  const { children } = props;

  return (
    <div>{children}</div>
  )
}

export default layout