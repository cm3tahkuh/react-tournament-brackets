import React from 'react';
import styled from 'styled-components';

type Placement = { label: string; name: string };

type Props = {
  placements: Placement[];
  width: number;
  itemHeight: number;
  gap: number;
  title?: string;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 100%;
  background: transparent;
  overflow: hidden;
`;

const Title = styled.div`
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.textColor.main};
  background: ${({ theme }) => theme.roundHeaders.background};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: ${({ theme }) => (theme as any).finalPlacementsBackground ?? theme.matchBackground.lostColor};
  border-left: 4px solid ${({ theme }) => theme.border.color};
  border-right: 4px solid ${({ theme }) => theme.border.color};
  border-top: 1px solid ${({ theme }) => theme.border.color};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  &:last-of-type {
    border-bottom: 1px solid ${({ theme }) => theme.border.color};
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  }
`;

const Label = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.textColor.dark};
`;

const Name = styled.div`
  margin-left: 12px;
  flex: 1;
  text-align: right;
  color: ${({ theme }) => theme.textColor.dark};
`;

export default function FinalPlacements({ placements, width, itemHeight, gap, title }: Props) {
  const totalHeight = placements.length * itemHeight + (placements.length - 1) * gap;
  return (
    <div style={{ width, height: totalHeight }}>
      <Container>
        {title && <Title>{title}</Title>}
        {placements.map((p, idx) => (
          <div key={p.label} style={{ marginTop: idx === 0 ? 0 : gap }}>
            <Row style={{ height: itemHeight }}>
              <Label>{p.label}</Label>
              <Name>{p.name}</Name>
            </Row>
          </div>
        ))}
      </Container>
    </div>
  );
}


