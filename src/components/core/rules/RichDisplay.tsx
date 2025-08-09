import React, { Fragment, useMemo } from 'react';

type Props = {
  value: string;
};

type Op = {
  insert: string;
  attributes?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    align?: 'left' | 'center' | 'right' | 'justify';
    list?: 'bullet' | 'ordered';
    header?: 1 | 2 | 3 | 4 | 5 | 6;
    'code-block'?: 'plain';
    blockquote?: boolean;
    link?: string;
    indent?: number;
  };
};

export default function RichDisplay({ value }: Props) {
  const segments = useMemo(() => {
    const parsed = JSON.parse(value);
    const ops = parsed.ops || [];
    const blocks = splitIntoBlocks(ops);
    const segments = blocksIntoSegments(blocks);
    // console.log({ parsed, blocks, segments });
    return segments;
  }, [value]);
  return (
    <div className="ql-snow">
      <div className="ql-editor" style={{ padding: '0px' }}>
        {segments.map((blocks, segIdx) => {
          const isFirst = segIdx === 0;
          const marginTop = isFirst ? 'mt-0' : 'mt-[10px]';
          return (
            <div
              key={segIdx}
              className={`editor-segment rounded-[10px] p-[10px] md:bg-black/15 bg-[#1C1C1C] ${marginTop} font-semibold text-base`}
            >
              {blocks.map((block, bIdx) => (
                <Block key={bIdx} block={block} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type BlockOp = {
  attributes: {
    'code-block'?: 'plain';
    blockquote?: boolean;
    header?: 1 | 2 | 3 | 4 | 5 | 6;
    list?: 'bullet' | 'ordered';
    align?: 'left' | 'center' | 'right' | 'justify';
  };
  children: BlockChild[];
};

type BlockChild = BlockChildOp[];
type BlockChildOp = {
  op: Op;
  closed: boolean;
};

function splitWithNewlines(str: string): string[] {
  // This regex matches either a sequence of non-newline characters or a single newline
  return str.match(/[^\n]+|\n/g) || [];
}

function getBlockLastChild(block: BlockOp): BlockChildOp | undefined {
  const lastChild = block.children[block.children.length - 1];
  if (lastChild) {
    return lastChild[lastChild.length - 1];
  }
  return undefined;
}

function setBlockAttributes(block: BlockOp, op: Op) {
  block.attributes.blockquote = op.attributes?.blockquote;
  block.attributes.header = op.attributes?.header;
  block.attributes.list = op.attributes?.list;
  block.attributes.align = op.attributes?.align;
  block.attributes['code-block'] = op.attributes?.['code-block'];
}

function splitIntoBlocks(ops: Op[]) {
  const blocks: BlockOp[] = [];
  let currentBlock: BlockOp = {
    attributes: {} as BlockOp['attributes'],
    children: [] as BlockChild[],
  };

  ops.forEach(op => {
    const insertItems = splitWithNewlines(op.insert);

    // console.log({ insert: op.insert, attrs: op.attributes })

    insertItems.forEach(item => {
      // console.log({ item });
      if (item === '\n') {
        if (op.attributes?.list) {
          const lastBlock = blocks[blocks.length - 1];
          if (lastBlock && lastBlock.attributes?.list === op.attributes?.list) {
            // add list items to last block
            const indent = op.attributes?.indent || 0;
            const lastChild = getBlockLastChild(currentBlock);
            if (lastChild && !lastChild.closed) {
              lastChild.op.attributes = {
                ...(lastChild.op.attributes ?? {}),
                indent,
                list: op.attributes?.list,
              };
              lastChild.closed = true;
              lastBlock.children.push(...currentBlock.children);
              currentBlock.children = [];
            } else {
              lastBlock.children.push(...currentBlock.children);
              currentBlock.children = [];

              lastBlock.children.push([
                {
                  closed: true,
                  op: {
                    insert: '',
                    attributes: {
                      indent,
                      list: op.attributes?.list,
                    },
                  },
                },
              ]);
            }
            return;
          }
        }

        const lastChild = getBlockLastChild(currentBlock);
        if (lastChild && !lastChild.closed) {
          lastChild.op.attributes = {
            ...(lastChild.op.attributes ?? {}),
            ...(op.attributes ?? {}),
          };
          lastChild.closed = true;

          setBlockAttributes(currentBlock, op);
          blocks.push(currentBlock);
          currentBlock = {
            attributes: {} as BlockOp['attributes'],
            children: [] as BlockChild[],
          };
        } else {
          currentBlock.children.push([
            {
              closed: true,
              op: {
                insert: '',
                attributes: op.attributes,
              },
            },
          ]);
          setBlockAttributes(currentBlock, op);
          blocks.push(currentBlock);
          currentBlock = {
            attributes: {} as BlockOp['attributes'],
            children: [] as BlockChild[],
          };
        }
      } else {
        const lastChild = getBlockLastChild(currentBlock);
        if (lastChild && !lastChild.closed) {
          const lastGroup = currentBlock.children[currentBlock.children.length - 1];
          lastGroup.push({
            closed: false,
            op: {
              insert: item,
              attributes: op.attributes,
            },
          });
        } else {
          currentBlock.children.push([
            {
              closed: false,
              op: {
                insert: item,
                attributes: op.attributes,
              },
            },
          ]);
        }
      }
    });
  });

  if (currentBlock.children.length > 0) {
    blocks.push(currentBlock);
  }

  return blocks;
}

function blocksIntoSegments(blocks: BlockOp[]) {
  const segments: BlockOp[][] = [];
  blocks.forEach(block => {
    if (block.attributes?.header === 1) {
      segments.push([block]);
    } else {
      const prevSegment = segments[segments.length - 1];
      if (prevSegment) {
        prevSegment.push(block);
      } else {
        segments.push([block]);
      }
    }
  });
  return segments;
}

type BlockProps = {
  block: BlockOp;
};

function Block({ block }: BlockProps) {
  let BlockTag: React.ElementType = 'p';
  if (block.attributes.blockquote) {
    BlockTag = 'blockquote';
  }
  if (block.attributes.header) {
    BlockTag = `h${block.attributes.header}`;
  }
  if (block.attributes.list) {
    BlockTag = 'ol';
  }
  if (block.attributes['code-block']) {
    BlockTag = 'pre';
  }

  let backgroundColor = 'transparent';
  if (block.attributes['code-block']) {
    backgroundColor = '#1e1e1e';
  }
  if (block.attributes.blockquote) {
    backgroundColor = '#1e1e1e';
  }

  return (
    <BlockTag
      style={{
        margin: '0',
        backgroundColor,
        textAlign: block.attributes.align,
      }}
    >
      {block.children.map((group, idx) => {
        const groupRendered = group.map((child, idx) => {
          return <BlockChild key={idx} op={child.op} />;
        });
        const groupLastChild = group[group.length - 1];
        if (block.attributes.list) {
          return (
            <li
              key={idx}
              data-list={block.attributes.list}
              className={`ql-indent-${groupLastChild?.op.attributes?.indent || 0}`}
            >
              <span className="ql-ui" />
              {groupRendered}
            </li>
          );
        }
        return <p key={idx}>{groupRendered}</p>;
      })}
    </BlockTag>
  );
}

function BlockChild({ op }: { op: Op }) {
  if (op.insert === '') {
    return <Fragment>&nbsp;</Fragment>;
  }

  let SpanElement: React.ElementType = 'span';
  const style: React.CSSProperties = {};

  const additionalProps: { [k: string]: string } = {};

  if (op.attributes?.bold) {
    style.fontWeight = 'bold';
  }
  if (op.attributes?.italic) {
    style.fontStyle = 'italic';
  }
  if (op.attributes?.underline) {
    style.textDecoration = 'underline';
  }
  if (op.attributes?.strike) {
    style.textDecoration = 'line-through';
  }
  if (op.attributes?.align) {
    style.textAlign = op.attributes.align;
  }
  if (op.attributes?.link) {
    SpanElement = 'a';
    style.color = '#4EA8DE';
    style.textDecoration = 'underline';
    style.cursor = 'pointer';
    additionalProps['href'] = op.attributes.link;
    additionalProps['target'] = '_blank';
    additionalProps['rel'] = 'noopener noreferrer';
  }

  const insertValues = op.insert.split('\n');
  return (
    <SpanElement style={style} {...additionalProps}>
      {insertValues.map((v, idx) => {
        const isFirst = idx === 0;
        return (
          <Fragment key={idx}>
            {!isFirst && <br />}
            {v}
          </Fragment>
        );
      })}
    </SpanElement>
  );
}
