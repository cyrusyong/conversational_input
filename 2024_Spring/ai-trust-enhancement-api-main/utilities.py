def get_all_text(f):
    t =  ""
    with open(f, 'r') as f:
        for line in f:
            t += line.strip()
    return t

print(get_all_text('haskell_jedi.txt'))